import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

// Schema for validating subscription creation requests
const subscriptionCreateSchema = z.object({
  priceId: z.string().min(1)
});

// Alternative schema for backward compatibility
const legacySubscriptionCreateSchema = z.object({
  plan: z.enum(["pro"]),
  interval: z.enum(["monthly", "quarterly", "annual"]),
});

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to create a subscription" },
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await req.json();
    
    // Try to validate with the new schema first
    const validatedData = subscriptionCreateSchema.safeParse(body);
    
    // If new schema validation fails, try the legacy schema
    let priceId: string;
    if (!validatedData.success) {
      const legacyValidation = legacySubscriptionCreateSchema.safeParse(body);
      
      if (!legacyValidation.success) {
        return NextResponse.json(
          { error: "Invalid request data", details: validatedData.error.format() },
          { status: 400 }
        );
      }
      
      // For legacy requests, get the price ID from the plan and interval
      const { plan, interval } = legacyValidation.data;
      
      // This would use the getPriceId function, but since we're moving away from it,
      // we'll handle it directly based on the environment variables
      if (plan === "pro") {
        if (interval === "monthly") {
          priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "";
        } else if (interval === "quarterly") {
          priceId = process.env.STRIPE_PRICE_ID_PRO_QUARTERLY || "";
        } else if (interval === "annual") {
          priceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "";
        } else {
          return NextResponse.json(
            { error: "Invalid interval" },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }
    } else {
      // For new requests, use the priceId directly
      priceId = validatedData.data.priceId;
    }
    
    // Validate that we have a valid priceId
    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }
    
    // Log the priceId for debugging
    console.log("Creating subscription with priceId:", priceId);
    
    // Get the user from the database
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
    
    // Check if user already has an active subscription
    const activeSubscription = user.subscriptions.length > 0 ? user.subscriptions[0] : null;
    
    if (activeSubscription && activeSubscription.status === "active") {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }
    
    // Generate success and cancel URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;
    
    // Create a Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      priceId,
      successUrl,
      cancelUrl,
    });
    
    // Return the checkout URL
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error) {
    console.error("Error creating subscription:", error);
    
    return NextResponse.json(
      { error: "Failed to create subscription", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view subscription details" },
        { status: 401 }
      );
    }
    
    // Get the user from the database with subscription details
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
    
    // Return the user's subscription details
    return NextResponse.json({
      subscription: user.subscriptions.length > 0 ? user.subscriptions[0] : null,
    });
    
  } catch (error) {
    console.error("Error fetching subscription:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
