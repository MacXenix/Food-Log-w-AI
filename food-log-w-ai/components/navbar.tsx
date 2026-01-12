"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";

export default function NavBar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <p> Loading... </p>;
  return (
    <nav>
      {" "}
      <div>
        <Link href="/">
          <Image src="/MofuLogoEating.png" width={60} height={60} alt="logo" />
        </Link>
      </div>
      <div>
        {" "}
        <SignedIn>
          <Link href="/food-log"> Food Log </Link>
          {user?.imageUrl ? (
            <Link href="/profile">
              {" "}
              <Image
                src={user.imageUrl}
                alt="Profile Picture"
                width={40}
                height={40}
              />
            </Link>
          ) : (
            <div>
                <Image
                  src="/defaultProfile.png"
                  width={40}
                  height={40}
                  alt="default profile"
                />
            </div>
          )}
        </SignedIn>
        <SignedOut>
            <SignInButton mode="modal">
                <button>
                    Sign In
                </button>
            </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
