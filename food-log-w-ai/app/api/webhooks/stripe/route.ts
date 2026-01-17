import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      webhookSecret,
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice; // Fixed type to Invoice
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
      // Optional: Log unhandled types if you really want to track them
      // console.log("ℹ️ Unhandled event type:", event.type);
    }
  } catch (error: any) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.clerkUserId;
  const subscriptionId = session.subscription as string;
  const planType = session.metadata?.planType || null;
  const email = session.customer_email || "";

  if (!userId || !subscriptionId) {
    console.error("❌ [ERROR] Missing userId or subscriptionId in metadata.");
    return; // Stop here to prevent crash
  }

  try {
    // Upsert ensures we either CREATE a new profile or UPDATE the existing one
    await prisma.profile.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: planType,
      },
      create: {
        userId,
        email, // Ensure this field exists in your schema
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: planType,
      },
    });



    console.log(`✅ Subscription ACTIVATED for user: ${userId}`);
  } catch (error: any) {
    console.error("❌ DB Upsert Failed:", error.message);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { subscriptionActive: isActive },
      });
      console.log(
        `🔄 Subscription STATUS UPDATED for user: ${profile.userId} -> ${subscription.status}`,
      );
    }
  } catch (error: any) {
    console.error("❌ Error updating subscription status:", error.message);
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { subscriptionActive: false },
      });
      console.log(
        `⚠️ Subscription DEACTIVATED (Payment Failed) for user: ${profile.userId}`,
      );
    }
  } catch (error: any) {
    console.error("❌ Error handling payment failure:", error.message);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  try {
    const profile = await prisma.profile.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (profile) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          subscriptionActive: false,
          stripeSubscriptionId: null, // Clear the ID so they can re-subscribe cleanly later
        },
      });
      console.log(
        `❌ Subscription DELETED/CANCELLED for user: ${profile.userId}`,
      );
    }
  } catch (error: any) {
    console.error("❌ Error handling subscription deletion:", error.message);
  }
}
