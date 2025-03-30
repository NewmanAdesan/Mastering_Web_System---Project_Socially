"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
        const user = await currentUser();
        const {userId} = await auth()

        if (!user || !userId) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        })

        if (existingUser) return existingUser;

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            }
        })

        return dbUser;
    } catch (error) {
        console.log("Error in syncUser", error);
    }
}

export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkId,
            },
            include: {
                _count: {
                    select: {
                        follower  : true,
                        following: true,
                        posts: true,
                    }
                }
            }
        })

        return user;
    } catch (error) {
        console.log("Error in getUserByClerkId", error);
    }
}

export async function getDbUserId() {
    const {userId: clerkId} = await auth()
    if (!clerkId) throw new Error("Unautorized"); 

    const user = await getUserByClerkId(clerkId);
    if (!user) throw new Error("User not found");

    return user.id
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId();

        // get 3 random users, exclude ourselves and users that we follow
        // we would use the FINDMANY because we want multiple fields
        // we would use the WHERE to specify a criteria for the fields we want
        // we use the AND to specify multiple criteria since we want to exclude ourselves and users that we follow
        // first criteria, we check that id property of the user object is not equal to the current user id
        // second criteria, we check that the follower property of the user object which is an array of followers does not have an item whose 
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    {NOT: {id: userId}},
                    {NOT: {
                        follower: {
                            some: {
                                followerId: userId
                            }
                        }
                    }}
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        follower: true,
                    }
                }
            },
            take: 3,
        })

        return randomUsers
    } catch (error) {
        console.error("Error fetching random users", error);
        return []
    }
}

export async function toggleFollow(targetUserId: string) {
    try {

        // get the database-id of the user
        const userId = await getDbUserId();
        if (!userId) return;

        // check if user is trying to follow themselves
        if (userId === targetUserId) throw new Error("You can't follow yourself");

        // check if user is already following the target user, if so, unfollow, else follow
        const isFollowing = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                }
            }
        })

        // if user is already following the target user, unfollow
        if (isFollowing) {
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId,
                    }
                }
            })
        } 


        // if user is not already following the target user, follow
        // to follow, we need to create a new follow object AND create a follow notification
        // we will only accept that this two database mutation be successful Thus, we setup a database transaction
        else {
            await prisma.$transaction([
                // create follow object
                prisma.follows.create({
                    data: {
                        followerId: userId,
                        followingId: targetUserId,
                    }
                }),
                // create follow notification
                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: userId,
                        creatorId: targetUserId,
                    }
                })
            ])
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error in toggling follow", error);
        return { success: false, error: "Error toggling follow" };
    }
}