import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint to check subscription status
 * GET /api/check-subscription
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!profile) {
      return NextResponse.json(
        { 
          message: "Profile not found",
          hasProfile: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      hasProfile: true,
      subscriptionActive: profile.subscriptionActive,
      subscriptionTier: profile.subscriptionTier,
      stripeSubscriptionId: profile.stripeSubscriptionId,
      email: profile.email,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  } catch (error: any) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
