import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to reactivate a subscription" },
        { status: 401 }
      );
    }

    const subscriptionId = params.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Verify that this subscription belongs to the current user
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found or does not belong to this user" },
        { status: 404 }
      );
    }

    // Reactivate the subscription by setting cancel_at_period_end to false
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    // Update the subscription in the database
    await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 }
    );
  }
}
