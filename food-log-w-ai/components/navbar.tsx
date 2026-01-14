"use client";

import Image from "next/image";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";

export default function NavBar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <p> Loading... </p>;
  return (
    <nav className="fixed top-0 left-0 w-full bg-[#aacfdd] shadow-sm z-50">
      {" "}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between ">
        <Link href="/">
          <Image
            src="/MofuLogoEating.png"
            width={60}
            height={60}
            alt="logo"
            className="text-xl font-bold text-[#37375e]  cursor-pointer"
          />
        </Link>
        <div className="space-x-6 flex items-center">
          {" "}
          <SignedIn>
            <Link
              href="/food-log"
              className="text-[#37375e] hover:text-[#356288] transition-colors"
            >
              {" "}
              Food Log{" "}
            </Link>
            {user?.imageUrl ? (
              <Link href="/profile">
                {" "}
                <Image
                  className="rounded-full"
                  src={user.imageUrl}
                  alt="Profile Picture"
                  width={40}
                  height={40}
                />
              </Link>
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            )}
            <SignOutButton>
              <button className="ml-4 px-4 py-2 bg-[#fe875d] text-white rounded hover:bg-[#fe1100] transition">
                {" "}
                Sign Out{" "}
              </button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <Link
              href="/"
              className="text-[#37375e] hover:text-[#356288] transition-colors"
            >
              Home
            </Link>
            <Link
              href={isSignedIn ? "/subscribe" : "/sign-up"}
              className="text-[#37375e] hover:text-[#356288] transition-colors"
            >
              Subscribe
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-[#356288] text-white rounded hover:bg-[#37375e] transition"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
