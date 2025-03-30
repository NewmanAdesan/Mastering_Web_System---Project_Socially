"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl: string) {
    try {
        const userId = await getDbUserId();
        if (!userId) return null;

        const post = await prisma.post.create({
            data: {
                content,
                image: imageUrl,
                authorId: userId,
            }
        })

        revalidatePath("/")
        return {success:true, post};
    } catch (error) {
        console.error("Failed to create post", error);
        return {success:false, error:"Failed to create post"}
    }
}

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc",
                    }
                },
                likes: {
                    select: {
                        userId: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            }
        })

         return posts;

    } catch (error) {
        console.error("Failed to get posts", error);
        throw new Error("Failed to fetch posts");
    }
}

export async function toggleLike(postId: string) {
    // authenticate action
    const userId = await getDbUserId();
    if (!userId) return null;

    try {
        // get information about the post
        const post = await prisma.post.findUnique({
            where: {
                id: postId
            },
            select: {
                authorId: true,
            }
        })
        if (!post) throw new Error('Post not found')
    
        // check if user has already liked the post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        })
    
        // if user has liked the post before, unlike the post by deleting the correponding like record
        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
        }
    
        // else, like the post; using db transactions to create a like record and conditionally create a notification record(only if user is liking another user's post)
        else {
            await prisma.$transaction([
                prisma.like.create({
                    data: {
                        userId,
                        postId
                    }
                }),
                ...(
                        userId !== post.authorId
                        ? 
                            [
                                prisma.notification.create({
                                    data: {
                                        type: "LIKE",
                                        userId: post.authorId,
                                        creatorId: userId,
                                        postId
                                    }
                                })
                            ]
                        : []
                )
            ]);
        }
    
        revalidatePath('/');
        return { success: true }

    } catch (error) {
        console.error("Failed to toggle like:", error);
        return { success: false, error: "Failed to toggle like" };
    }

}

export async function createComment(postId: string, content: string) {
    try {
        // authenticate action using clerkId
        const userId = await getDbUserId();
        if (!userId) return null;
        if (!content) throw new Error("Content is required");

        // To create a notification record of type comment, we need to obtain the authorId of the post
        const post = await prisma.post.findUnique({
            where: {id: postId},
            select: {authorId: true,}
        })
        if (!post) throw new Error("Post not found");

        // creating a comment is an ordered atomic action involving the comment record and the notification record creation. ordered meaning we create the comment record first, then the notification record second, because we need the commentId to create the notification record
        const [comment] = await prisma.$transaction(
            async (tx) => {
                // Create the comment record first
                const newComment = await tx.comment.create({
                    data: {
                        content,
                        authorId: userId,
                        postId
                    }
                })
                // Create the notification record second
                if (userId !== post.authorId) {
                    await tx.notification.create({
                        data: {
                            type: "COMMENT",
                            userId: post.authorId,
                            creatorId: userId,
                            postId,
                            commentId: newComment.id
                        }
                    })
                }

                return [newComment]
            }
        )

        revalidatePath("/");
        return { success: true, comment };
    } catch (error) {
        console.error("Failed to create comment:", error);
        return  { success: false, error: "Failed to create comment" };
    }
}

export async function deletePost(postId: string) {
    try {
        // authenticate the action using the user clerkId
        const userId = await getDbUserId();
        if (!userId) return null;

        // get the authorId of the post to be deleted
        const post = await prisma.post.findUnique({
            where: {id: postId},
            select: {authorId: true},
        })
        if (!post) throw new Error("Post not found");

        // ensure user has permission to delete the post
        if (userId !== post.authorId) throw new Error("You do not have permission to delete this post");

        // delete the post
        await prisma.post.delete({
            where: {id: postId}
        })

        revalidatePath("/"); // purge the cache
        return { success: true };
    } catch (error) {
        console.error("Failed to delete post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}