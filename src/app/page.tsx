import ModalToggle from "@/components/ModalToggle";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <SignedOut>
          <SignInButton mode="modal">
              <Button>Sign in</Button>
          </SignInButton>
      </SignedOut>
      <SignedIn>
          <UserButton />
      </SignedIn>
      <ModalToggle />
    </div>
  );
}
