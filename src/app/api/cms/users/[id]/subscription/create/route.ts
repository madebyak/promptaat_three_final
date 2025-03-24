import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";

export const runtime = 'nodejs';

// Schema for validating subscription creation request
const createSubscriptionSchema = z.object({
  plan: z.string().optional().default("pro"),
  interval: z.string().optional().default("monthly"),
  days: z.number().int().positive().default(30),
});

// Create a new subscription for a user
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
    const validationResult = createSubscriptionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { plan, interval, days } = validationResult.data;

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

    // Check if user already has an active subscription
    const existingSubscription = user.subscriptions[0];
    
    if (existingSubscription) {
      // If there's an existing subscription, update it
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);
      
      const updatedSubscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: "active",
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          plan: plan,
          interval: interval,
          cancelAtPeriodEnd: false,
        },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "UPDATE_MANUAL_SUBSCRIPTION",
          entityType: "subscription",
          entityId: updatedSubscription.id,
          details: {
            userId: user.id,
            email: user.email,
            plan: plan,
            interval: interval,
            days: days,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        subscription: updatedSubscription,
      });
    } else {
      // If no existing subscription, create a new one
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);
      
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          status: "active",
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          plan: plan,
          interval: interval,
          cancelAtPeriodEnd: false,
        },
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "CREATE_MANUAL_SUBSCRIPTION",
          entityType: "subscription",
          entityId: newSubscription.id,
          details: {
            userId: user.id,
            email: user.email,
            plan: plan,
            interval: interval,
            days: days,
            isManual: true,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription created successfully",
        subscription: newSubscription,
      });
    }
  } catch (error) {
    console.error("Error creating/updating manual subscription:", error);
    return NextResponse.json(
      { error: "Failed to create/update subscription" },
      { status: 500 }
    );
  }
}
