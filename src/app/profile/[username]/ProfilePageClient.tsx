'use client'
import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action"
import { toggleFollow } from "@/actions/user.action"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { useState } from "react"


type User = Awaited<ReturnType<typeof getProfileByUsername>>
type Posts = Awaited<ReturnType<typeof getUserPosts>>
interface ProfilePageClientProps {
    user: NonNullable<User> // since we already checked for null in the parent component
    posts: Posts
    likedPosts: any
    isFollowing: boolean
}


function ProfilePageClient({user, posts, likedPosts, isFollowing:isInitialFollowing}: ProfilePageClientProps) {
  const {user: currentUser} = useUser()
  const [isFollowing, setIsFollowing] = useState(isInitialFollowing)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  })

  const { toast } = useToast();

  const handleEditSubmit = async () => {
    const formData = new FormData()
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const result = await updateProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast({
        title: "Profile updated successfully",
      });
    }
  }

  const handleFollow = async () => { 
      if (!currentUser) return;
      try {
          setIsUpdatingFollow(true);
          await toggleFollow(user.id);
          setIsFollowing(!isFollowing);

      } catch (error) {
          toast({
            title: "Failed to update follow status",
            variant: "destructive"
          })
      } finally {
          setIsUpdatingFollow(false);
      }
  }

  const isOwnProfile = 
    currentUser?.username === user.username 
    || 
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy")

  return (
    <div>ProfilePageClient</div>
  )
}

export default ProfilePageClient


