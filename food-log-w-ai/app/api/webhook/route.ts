import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {stripe} from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest){
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    let event: Stripe.Event;
    try{
        event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
    }catch (error: any){
        return NextResponse.json({error: error.message}, {status: 400});
    }
    try{
        console.log("✅ Webhook received:", event.type);
        switch(event.type){
            case "checkout.session.completed":
            {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }
            case "invoice.payment_failed":
            {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }
            case "customer.subscription.updated":{
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }
            case "customer.subscription.deleted":{
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;  
            }
            default:
                console.log("ℹ️ Unhandled event type:", event.type);
        }
        return NextResponse.json({ received: true }, { status: 200 });
    }catch(error: any){
        console.error("❌ Error processing webhook:", error);
        return NextResponse.json({error: error.message}, {status: 500})
    }
}


async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session){
    // Debug: Log session metadata at the very start
    console.log("🔍 [DEBUG] Session metadata:", JSON.stringify(session.metadata, null, 2));
    console.log("🔍 [DEBUG] Full session object keys:", Object.keys(session));
    console.log("🔍 [DEBUG] Session subscription:", session.subscription);
    console.log("🔍 [DEBUG] Session customer_email:", session.customer_email);
    
    const userId = session.metadata?.clerkUserId;
    if(!userId){
        console.error("❌ [ERROR] clerkUserId is missing from session.metadata. Cannot process subscription.");
        console.error("❌ [ERROR] Available metadata keys:", session.metadata ? Object.keys(session.metadata) : "metadata is null/undefined");
        // Return without throwing to prevent Stripe from retrying endlessly
        return;
    }

    const subscriptionId = session.subscription as string;
    if(!subscriptionId){
        console.error("❌ [ERROR] No subscription ID in session. Session ID:", session.id);
        // Return without throwing to prevent Stripe from retrying endlessly
        return;
    }

    const planType = session.metadata?.planType || null;
    const email = session.customer_email || "";

    // Validate email is present for profile creation
    if (!email) {
        console.error("❌ [ERROR] No customer email in session. Cannot create profile.");
        return;
    }

    try{
        console.log("🔄 Attempting to upsert profile:", {
            userId,
            email,
            subscriptionId,
            planType,
        });

        // Use upsert to handle both create and update cases
        const profile = await prisma.profile.upsert({
            where: { userId },
            update: {
                stripeSubscriptionId: subscriptionId,
                subscriptionActive: true,
                subscriptionTier: planType,
            },
            create: {
                userId,
                email,
                stripeSubscriptionId: subscriptionId,
                subscriptionActive: true,
                subscriptionTier: planType,
            }
        });

        console.log("✅ Profile upserted successfully - Subscription activated for user:", userId);
        console.log("✅ Profile details after update:", {
            id: profile.id,
            userId: profile.userId,
            subscriptionActive: profile.subscriptionActive,
            subscriptionTier: profile.subscriptionTier,
            stripeSubscriptionId: profile.stripeSubscriptionId,
        });

        // Verify the update actually worked
        const verifyProfile = await prisma.profile.findUnique({
            where: { userId },
        });
        if (verifyProfile) {
            console.log("✅ Verification - Profile in database:", {
                subscriptionActive: verifyProfile.subscriptionActive,
                subscriptionTier: verifyProfile.subscriptionTier,
            });
        } else {
            console.error("❌ Verification failed - Profile not found after update!");
        }
    }catch(error: any){
        console.error("❌ Error upserting profile:", error);
        console.error("❌ Error details:", {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
        });
        // Don't throw - let the webhook return 200 OK to prevent endless retries
        // The error is logged above for debugging
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription){
    const subscriptionId = subscription.id;
    console.log("🔄 Processing customer.subscription.updated:", subscriptionId);
    console.log("🔄 Subscription status:", subscription.status);
    
    try{
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
        });

        if(profile){
            const isActive = subscription.status === "active" || subscription.status === "trialing";
            const updatedProfile = await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    subscriptionActive: isActive,
                }
            });
            console.log("✅ Subscription updated for user:", profile.userId);
            console.log("✅ New subscription status:", {
                subscriptionStatus: subscription.status,
                subscriptionActive: updatedProfile.subscriptionActive,
            });
        } else {
            console.log("⚠️ Profile not found for subscription:", subscriptionId);
        }
    }catch(error: any){
        console.error("❌ Error handling subscription update:", error.message);
        throw error;
    }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice){
    const subscriptionId = invoice.subscription as string;
    if(!subscriptionId){
        console.log("⚠️ No subscription Id in invoice");
        return;
    }

    try{
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
        });

        if(profile){
            await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    subscriptionActive: false,
                }
            });
            console.log("✅ Subscription deactivated due to payment failure - User:", profile.userId);
        } else {
            console.log("⚠️ Profile not found for subscription:", subscriptionId);
        }
    }catch(error: any){
        console.error("❌ Error handling payment failure:", error.message);
        throw error;
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription){
    const subscriptionId = subscription.id;
    
    try{
        const profile = await prisma.profile.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
        });

        if(profile){
            await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    subscriptionActive: false,
                    stripeSubscriptionId: null,
                }
            });
            console.log("✅ Subscription deleted - Profile deactivated for user:", profile.userId);
        } else {
            console.log("⚠️ Profile not found for subscription:", subscriptionId);
        }
    }catch(error: any){
        console.error("❌ Error handling subscription deletion:", error.message);
        throw error;
    }
}