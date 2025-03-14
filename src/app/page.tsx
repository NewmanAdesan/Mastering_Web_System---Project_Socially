import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <SignedOut>
          <SignInButton mode="modal">
              <button className="bg-red-500">Sign in</button>
          </SignInButton>
      </SignedOut>
      <SignedIn>
          <UserButton />
      </SignedIn>
    </div>
  );
}
