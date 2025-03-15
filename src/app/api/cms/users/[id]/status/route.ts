import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";

export const runtime = 'nodejs';

// Schema for validating request body
const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
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
    const validationResult = updateStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { isActive } = validationResult.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        country: true,
        occupation: true,
        _count: {
          select: {
            bookmarks: true,
            history: true,
            catalogs: true,
          },
        },
        subscriptions: {
          where: {
            OR: [
              { status: "active" },
              { status: "trialing" },
              { currentPeriodEnd: { gt: new Date() } }
            ]
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          select: {
            id: true,
            status: true,
            createdAt: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            priceId: true,
            stripeSubscriptionId: true,
            stripePriceId: true,
            interval: true,
            plan: true
          }
        },
      },
    });

    // Format the response to include subscription data in a more accessible format
    const formattedUser = {
      ...updatedUser,
      subscription: updatedUser.subscriptions && updatedUser.subscriptions.length > 0 ? {
        ...updatedUser.subscriptions[0],
        startDate: updatedUser.subscriptions[0].currentPeriodStart,
        endDate: updatedUser.subscriptions[0].currentPeriodEnd
      } : null,
      subscriptions: undefined // Remove the subscriptions array from the response
    };

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        entityType: "USER",
        entityId: userId,
        details: {
          userId,
          previousStatus: existingUser.isActive,
          newStatus: isActive,
        },
      },
    });

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("Update user status error:", error);
    
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
