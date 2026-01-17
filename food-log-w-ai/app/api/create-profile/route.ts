import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log("📝 Profile creation request received");
    console.log("📝 Request timestamp:", new Date().toISOString());
    
    const clerkUser = await currentUser();
    console.log("👤 Clerk user:", clerkUser ? { id: clerkUser.id, email: clerkUser.emailAddresses[0]?.emailAddress } : "null");
    
    if (!clerkUser) {
      console.log("⚠️ User not found in Clerk");
      return NextResponse.json(
        { error: "User not found in clerk." },
        { status: 404 }
      );
    }
    
    const email = clerkUser?.emailAddresses[0]?.emailAddress || "";
    console.log("📧 User email:", email || "NOT FOUND");
    
    if (!email) {
      console.log("⚠️ User does not have an email address");
      return NextResponse.json(
        { error: "User does not have an email address." },
        { status: 400 }
      );
    }

    console.log("🔍 Checking for existing profile for user:", clerkUser.id);
    let existingProfile;
    try {
      existingProfile = await prisma.profile.findUnique({
        where: { userId: clerkUser.id },
      });
      console.log("🔍 Existing profile check result:", existingProfile ? "FOUND" : "NOT FOUND");
    } catch (dbError: any) {
      console.error("❌ Error checking for existing profile:", dbError);
      throw dbError;
    }

    if (existingProfile) {
      console.log("ℹ️ Profile already exists for user:", clerkUser.id, "Profile ID:", existingProfile.id);
      return NextResponse.json(
        { message: "Profile already exists." },
        { status: 200 }
      );
    }

    console.log("➕ Creating new profile with data:", {
      userId: clerkUser.id,
      email,
      subscriptionTier: null,
      stripeSubscriptionId: null,
      subscriptionActive: false,
    });

    let newProfile;
    try {
      newProfile = await prisma.profile.create({
        data: {
          userId: clerkUser.id,
          email,
          subscriptionTier: null,
          stripeSubscriptionId: null,
          subscriptionActive: false,
        },
      });
      console.log("✅ Profile created successfully!");
      console.log("✅ Profile details:", {
        id: newProfile.id,
        userId: newProfile.userId,
        email: newProfile.email,
        createdAt: newProfile.createdAt,
      });
    } catch (createError: any) {
      console.error("❌ Error during profile creation:", createError);
      console.error("❌ Create error details:", {
        message: createError?.message,
        code: createError?.code,
        meta: createError?.meta,
        stack: createError?.stack,
      });
      throw createError;
    }

    return NextResponse.json(
      { message: "Profile created successfully.", profileId: newProfile.id },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ Error creating profile:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    
    // Return more specific error messages
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Profile already exists for this user." },
        { status: 409 }
      );
    }
    
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error.",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
