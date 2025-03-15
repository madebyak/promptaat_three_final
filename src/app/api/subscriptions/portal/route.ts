import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

// Schema for validating portal session creation requests
const portalSessionCreateSchema = z.object({
  customerId: z.string(),
  returnUrl: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to access the billing portal" },
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const validatedData = portalSessionCreateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    const { customerId, returnUrl } = validatedData.data;
    
    // Get the user and their subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
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
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    const activeSubscription = user.subscriptions.length > 0 ? user.subscriptions[0] : null;
    
    if (!activeSubscription || !activeSubscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }
    
    // Verify that the customerId belongs to the user
    if (activeSubscription.stripeCustomerId !== customerId) {
      return NextResponse.json(
        { error: "Unauthorized access to customer portal" },
        { status: 403 }
      );
    }
    
    // Create a Stripe portal session
    const portalSession = await createPortalSession({
      customerId,
      returnUrl,
    });
    
    // Return the portal URL
    return NextResponse.json({ url: portalSession.url });
    
  } catch (error) {
    console.error("Error creating portal session:", error);
    
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
