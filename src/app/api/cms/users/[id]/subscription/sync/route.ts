import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
});

// Define Stripe subscription type with plan property
interface StripeSubscriptionWithPlan extends Stripe.Subscription {
  plan?: {
    id: string;
    product: string;
    interval: string;
  };
}

// Define the subscription update data type
interface SubscriptionUpdateData {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripePriceId?: string;
  priceId?: string;
  interval?: string;
}

export const runtime = 'nodejs';

// Sync subscription data with Stripe
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user ID from params
    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists with subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the active subscription
    const subscription = user.subscriptions[0];

    if (!subscription) {
      return NextResponse.json(
        { error: "User has no subscription to sync" },
        { status: 404 }
      );
    }

    // Check if subscription has a Stripe ID
    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Subscription has no associated Stripe ID" },
        { status: 400 }
      );
    }

    // Fetch the subscription from Stripe
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      ) as StripeSubscriptionWithPlan;
    } catch (error) {
      console.error("Error fetching Stripe subscription:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscription from Stripe" },
        { status: 500 }
      );
    }

    // Prepare update data based on Stripe subscription
    const updateData: SubscriptionUpdateData = {
      status: stripeSubscription.status.toLowerCase(),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    };

    // Add optional fields if they exist in the Stripe subscription
    if (stripeSubscription.plan?.id) {
      updateData.stripePriceId = stripeSubscription.plan.id;
    }

    if (stripeSubscription.plan?.product) {
      updateData.priceId = stripeSubscription.plan.product;
    }

    if (stripeSubscription.plan?.interval) {
      updateData.interval = stripeSubscription.plan.interval;
    }

    // Update the subscription in the database
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: updateData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "SYNC_SUBSCRIPTION",
        entityType: "subscription",
        entityId: subscription.id,
        details: {
          userId: user.id,
          email: user.email,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          changes: JSON.parse(JSON.stringify(updateData)) // Convert to plain JSON object
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      stripeDetails: stripeSubscription,
      message: "Subscription successfully synchronized with Stripe",
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}
