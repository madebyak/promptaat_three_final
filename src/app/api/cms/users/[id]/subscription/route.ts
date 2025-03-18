import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

export const runtime = 'nodejs';

// Schema for validating subscription update request
const updateSubscriptionSchema = z.object({
  status: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  plan: z.string().optional(),
  interval: z.string().optional(),
});

// Get subscription details for a user
export async function GET(
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

    // Get user with subscription
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

    // If there's a Stripe subscription ID, fetch additional details from Stripe
    let stripeSubscription = null;
    if (subscription?.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error);
        // Continue without Stripe data if there's an error
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "VIEW_SUBSCRIPTION",
        entityType: "subscription",
        entityId: subscription?.id || "none",
        details: {
          userId: user.id,
          email: user.email,
        },
      },
    });

    return NextResponse.json({
      subscription: subscription || null,
      stripeDetails: stripeSubscription || null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}

// Update subscription details
export async function PUT(
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

    // Validate request body
    const body = await request.json();
    const validationResult = updateSubscriptionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { status, currentPeriodEnd, plan, interval } = validationResult.data;

    // Check if user exists
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
        { error: "User has no subscription to update" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status.toLowerCase(); // Normalize to lowercase
    }
    
    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = new Date(currentPeriodEnd);
    }
    
    if (plan) {
      updateData.plan = plan;
    }
    
    if (interval) {
      updateData.interval = interval;
    }

    // Update the subscription in the database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE_SUBSCRIPTION",
        entityType: "subscription",
        entityId: subscription.id,
        details: {
          userId: user.id,
          email: user.email,
          changes: updateData,
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
