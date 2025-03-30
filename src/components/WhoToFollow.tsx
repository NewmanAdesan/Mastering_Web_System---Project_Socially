import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";


async function WhoToFollow () {
  const users = await getRandomUsers();
  if (users.length === 0) return null;

  const WhoToFollowItem = ({ user }: { user : typeof users[number]}) => {
    return (
      <div className="flex gap-2 items-center justify-between">
          {/* card info */}
          <div className="flex items-center gap-1">
            <Link href={`/profile/${user.username}`}>
               <Avatar>
                  <AvatarImage src={user.image ?? "/avatar.png"} />
               </Avatar>
            </Link>
            <div className="text-xs">
              <Link href={`/profile/${user.username}`} className="font-medium cursor-pointer">
                {user.name}
              </Link>
              <p className="text-muted-foreground">@{user.username}</p>
              <p className="text-muted-foreground">{user._count.follower} followers</p>
            </div>
          </div>

          {/* card action */}
          <FollowButton userId={user.id} />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {
            users.map(
              (user) => (
                <WhoToFollowItem key={user.id} user={user} />
              )
            )
          }
        </div>
      </CardContent>
    </Card>
  )
}

export default WhoToFollow