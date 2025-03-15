import { currentUser } from "@clerk/nextjs/server"
import ModalToggle from "./ModalToggle";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";


async function DesktopNavbar() {
  const user = await currentUser();
  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModalToggle />
      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="size-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      {
        user ? (
          <>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link href="/notifications">
                <BellIcon className="size-4" />
                <span className="hidden lg:inline">Notifications</span>
              </Link>
            </Button>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link href={`/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]}`}>
                <UserIcon className="size-4" />
                <span className="hidden lg:inline">Profile</span>
              </Link>
            </Button>
            <UserButton />
          </>
        ) : (
          <SignInButton mode="modal">
            <Button variant="default">Sign in</Button>
          </SignInButton>
        )
      }
    </div>
  )
}

export default DesktopNavbar