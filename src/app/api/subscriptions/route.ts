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
    console.log("[API] Subscription creation request received");
    
    // Get the authenticated user's session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log("[API] Session retrieved:", session ? "Success" : "No session");
    } catch (sessionError) {
      console.error("[API] Error getting session:", sessionError);
      return NextResponse.json(
        { error: "Authentication error", message: sessionError instanceof Error ? sessionError.message : "Unknown error" },
        { status: 401 }
      );
    }
    
    if (!session?.user?.email) {
      console.log("[API] Authentication error: No user session found");
      return NextResponse.json(
        { error: "You must be logged in to create a subscription" },
        { status: 401 }
      );
    }
    
    console.log(`[API] Processing subscription request for user: ${session.user.email}`);
    
    // Parse and validate the request body
    let body;
    try {
      body = await req.json();
      console.log("[API] Request body:", JSON.stringify(body));
    } catch (error) {
      console.error("[API] Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    // Try to validate with the new schema first
    const validatedData = subscriptionCreateSchema.safeParse(body);
    
    // If new schema validation fails, try the legacy schema
    let priceId: string;
    if (!validatedData.success) {
      console.log("[API] New schema validation failed, trying legacy schema");
      const legacyValidation = legacySubscriptionCreateSchema.safeParse(body);
      
      if (!legacyValidation.success) {
        console.error("[API] Both schema validations failed");
        console.error("[API] Validation errors:", JSON.stringify(validatedData.error.format()));
        return NextResponse.json(
          { error: "Invalid request data", details: validatedData.error.format() },
          { status: 400 }
        );
      }
      
      // For legacy requests, get the price ID from the plan and interval
      const { plan, interval } = legacyValidation.data;
      console.log(`[API] Legacy request with plan: ${plan}, interval: ${interval}`);
      
      // Use both NEXT_PUBLIC_ prefixed variables and non-prefixed ones for backward compatibility
      if (plan === "pro") {
        if (interval === "monthly") {
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "";
        } else if (interval === "quarterly") {
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY || process.env.STRIPE_PRICE_ID_PRO_QUARTERLY || "";
        } else if (interval === "annual") {
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "";
        } else {
          console.error(`[API] Invalid interval: ${interval}`);
          return NextResponse.json(
            { error: "Invalid interval" },
            { status: 400 }
          );
        }
      } else {
        console.error(`[API] Invalid plan: ${plan}`);
        return NextResponse.json(
          { error: "Invalid plan" },
          { status: 400 }
        );
      }
    } else {
      // For new requests, use the priceId directly
      priceId = validatedData.data.priceId;
      console.log(`[API] Using provided priceId: ${priceId}`);
    }
    
    // Validate that we have a valid priceId
    if (!priceId) {
      console.error("[API] No valid priceId found");
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }
    
    // Log the priceId for debugging
    console.log("[API] Creating subscription with priceId:", priceId);
    
    // Get the user from the database
    let user;
    try {
      user = await prisma.user.findUnique({
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
    } catch (error) {
      console.error("[API] Database error when fetching user:", error);
      console.error("[API] Error details:", error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : "Unknown error type");
      
      return NextResponse.json(
        { error: "Database error when fetching user", message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
    
    if (!user) {
      console.error(`[API] User not found for email: ${session.user.email}`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    console.log(`[API] User found: ${user.id}`);
    
    // Check if user already has an active subscription
    const activeSubscription = user.subscriptions.length > 0 ? user.subscriptions[0] : null;
    
    if (activeSubscription && activeSubscription.status === "active") {
      console.log(`[API] User already has an active subscription: ${activeSubscription.id}`);
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }
    
    // Generate success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pricing`;
    
    console.log(`[API] Success URL: ${successUrl}`);
    console.log(`[API] Cancel URL: ${cancelUrl}`);
    
    // Call the stripe createCheckoutSession function with detailed error handling
    let checkoutSession;
    try {
      console.log("[API] Calling createCheckoutSession with:", {
        userId: user.id,
        email: user.email,
        priceId: priceId,
        successUrl,
        cancelUrl
      });
      
      checkoutSession = await createCheckoutSession({
        userId: user.id,
        email: user.email,
        priceId,
        successUrl,
        cancelUrl,
      });
      
      console.log(`[API] Checkout session created: ${checkoutSession.id}`);
    } catch (error) {
      console.error("[API] Error creating Stripe checkout session:", error);
      console.error("[API] Error details:", error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : "Unknown error type");
      
      // Check if it's a Stripe error with more details
      if (error && typeof error === 'object' && 'type' in error) {
        console.error("[API] Stripe error details:", error);
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create Stripe checkout session", 
          message: error instanceof Error ? error.message : "Unknown error",
          code: "stripe-token" // Add the specific error code that's showing up in the UI
        },
        { status: 500 }
      );
    }
    
    // Return the checkout URL
    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error) {
    console.error("[API] Unhandled error in subscription creation:", error);
    console.error("[API] Error details:", error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : "Unknown error type");
    
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
    console.error("[API] Error details:", error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : "Unknown error type");
    
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 500 }
    );
  }
}
