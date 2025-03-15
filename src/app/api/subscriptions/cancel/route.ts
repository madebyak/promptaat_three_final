import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { cancelSubscription } from "@/lib/stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

// Schema for validating subscription cancellation requests
const subscriptionCancelSchema = z.object({
  subscriptionId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to cancel a subscription" },
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = subscriptionCancelSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    const { subscriptionId } = validatedData.data;
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscriptions: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get the subscription from the database directly
    // Now looking for the subscription using the stripeSubscriptionId field
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        OR: [
          { id: subscriptionId },
          { stripeSubscriptionId: subscriptionId }
        ]
      }
    });
    
    if (!subscription) {
      console.error("Subscription not found", {
        userId: user.id,
        subscriptionId,
        userSubscriptions: user.subscriptions.map(s => ({
          id: s.id,
          stripeSubscriptionId: s.stripeSubscriptionId
        }))
      });
      
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    
    // Check if the subscription is already marked for cancellation
    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is already scheduled for cancellation" },
        { status: 400 }
      );
    }
    
    // Use the stripeSubscriptionId for cancellation with Stripe if available
    const stripeSubId = subscription.stripeSubscriptionId || subscriptionId;
    
    // Cancel the subscription with Stripe
    const result = await cancelSubscription({
      subscriptionId: stripeSubId,
    });
    
    // Update the subscription in the database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      subscription: {
        id: subscription.id,
        status: result.subscription.status,
        currentPeriodEnd: new Date(result.subscription.current_period_end * 1000),
        cancelAtPeriodEnd: result.subscription.cancel_at_period_end,
        stripeSubscriptionId: subscription.stripeSubscriptionId || subscriptionId,
      }
    });
    
  } catch (error) {
    console.error("Error canceling subscription:", error);
    
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
