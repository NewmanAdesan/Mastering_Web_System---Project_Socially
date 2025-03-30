import { getPosts, toggleLike } from "@/actions/post.action"
import { useUser } from "@clerk/nextjs";
import { useState } from "react"


// concept 1: type extraction
type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]


function PostCard({post, dbUserId}: {post: Post, dbUserId: string | null}) {
  const { user } = useUser();

  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some(like => like.userId === dbUserId));
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);  // concept 2: optimistic updates

  const [isDeleting, setIsDeleting] = useState(false);

  const handleLikePost = async () => {
    if (isLiking) return;
    try {
        setIsLiking(true);
        setHasLiked(prev => !prev);
        setOptimisticLikes(prev => prev + (hasLiked ? -1 : 1));
        await toggleLike(post.id);
    } catch (error) {
        setHasLiked(post.likes.some(like => like.userId === dbUserId));
        setOptimisticLikes(post._count.likes);
    } finally {
      setIsLiking(false);
    }
  }

  const handleAddComment = async () => {}
   
  const handleDeletePost = async () => {}

  return (
    <div>PostCard</div>
  )
}

export default PostCard