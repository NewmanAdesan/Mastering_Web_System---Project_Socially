'use server'

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";


export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                location: true,
                website: true,
                createdAt: true,
                _count: {
                    select: {
                        follower: true,
                        following: true,
                        posts: true,
                    }
                }
            }

        })

        return user;    
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
    }
}


export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId,
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
            },
            orderBy: {
                createdAt: "desc",
            }
        })

        return posts;

    } catch (error) {
        console.error("Failed to get posts", error);
        throw new Error("Failed to fetch posts");
    }
}


export async function getUserLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId
                    }
                }
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
            },
            orderBy: {
                createdAt: "desc",
            }
        })

        return likedPosts;
    } catch (error) {
        console.error("Failed to get liked posts", error);
        throw new Error("Failed to fetch liked posts");
    }
}


export async function updateProfile(formData: FormData) {
    try {
        // authenticate this action
        const { userId:clerkId } = await auth();
        if (!clerkId) throw new Error ("Unauthorized")
    
        // extract the data from the form
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;
    
        // update the user field in the database
        const updatedUser = await prisma.user.update({
            where: {clerkId},
            data: {name, bio, location, website}
        })

        revalidatePath('/profile');
        return { success:true, user:updatedUser}
    } catch (error) {
        console.error("Failed to update your profile")
        return { success:false, error: "Failed to update your profile"}
    }
}


export async function isFollowing(userId: string) {

    try {
        // authenticate this action & get the current userId
        const currentUserId = await getDbUserId();
        if (!currentUserId) return false;
    
        // check if the current user is following the target user
        const isFollowing = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId,
                }
            }
        })
    
        return !!isFollowing;
    } catch (error) {
        console.error("Error checking if user is following", error);
        return false;
    }

}