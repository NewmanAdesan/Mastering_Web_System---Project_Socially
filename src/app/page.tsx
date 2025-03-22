import ModalToggle from "@/components/ModalToggle";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default async function Home() {
  return (
    <div>
      <h1>Home page content</h1>
    </div>
  );
}
