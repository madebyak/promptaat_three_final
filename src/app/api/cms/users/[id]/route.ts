import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        occupation: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profileImageUrl: true,
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
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response to include subscription data in a more accessible format
    const formattedUser = {
      ...user,
      subscription: user.subscriptions && user.subscriptions.length > 0 ? {
        ...user.subscriptions[0],
        startDate: user.subscriptions[0].currentPeriodStart,
        endDate: user.subscriptions[0].currentPeriodEnd
      } : null,
      subscriptions: undefined // Remove the subscriptions array from the response
    };
    
    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("Get user error:", error);
    
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
