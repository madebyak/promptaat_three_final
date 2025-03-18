import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";

export const runtime = 'nodejs';

// Schema for validating subscription extension request
const extendSubscriptionSchema = z.object({
  extensionDays: z.number().int().positive(),
  reactivate: z.boolean().optional().default(false),
});

// Extend a subscription period
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

    // Validate request body
    const body = await request.json();
    const validationResult = extendSubscriptionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { extensionDays, reactivate } = validationResult.data;

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
        { error: "User has no subscription to extend" },
        { status: 404 }
      );
    }

    // Calculate new end date
    const currentEndDate = new Date(subscription.currentPeriodEnd);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + extensionDays);

    // Prepare update data
    const updateData: any = {
      currentPeriodEnd: newEndDate,
    };

    // If reactivate is true and subscription is canceled, reactivate it
    if (reactivate && subscription.status.toLowerCase() === 'canceled') {
      updateData.status = 'active';
      updateData.cancelAtPeriodEnd = false;
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
        action: "EXTEND_SUBSCRIPTION",
        entityType: "subscription",
        entityId: subscription.id,
        details: {
          userId: user.id,
          email: user.email,
          extensionDays,
          previousEndDate: currentEndDate,
          newEndDate,
          reactivated: reactivate && subscription.status.toLowerCase() === 'canceled',
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Subscription extended by ${extensionDays} days, from ${currentEndDate.toISOString().split('T')[0]} to ${newEndDate.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    console.error("Error extending subscription:", error);
    return NextResponse.json(
      { error: "Failed to extend subscription" },
      { status: 500 }
    );
  }
}
