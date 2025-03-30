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
    
}