import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma/client";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers to all responses
    const headers = { ...corsHeaders };

    // Get the session
    const session = await getServerSession(authOptions);
    
    // Debug session information
    console.log("Session in API:", {
      hasSession: !!session,
      hasUser: session ? !!session.user : false,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      console.error("Authentication failed: No valid session");
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to create a subscription", code: "auth_required" },
        { status: 401, headers }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid request body", code: "invalid_request" },
        { status: 400, headers }
      );
    }
    
    const { priceId } = body;

    if (!priceId) {
      console.error("Missing priceId in request");
      return NextResponse.json(
        { error: "Bad Request", message: "Price ID is required", code: "missing_price_id" },
        { status: 400, headers }
      );
    }

    // Get the user from the database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          email: true,
          subscriptions: {
            select: {
              stripeCustomerId: true,
            },
            where: {
              stripeCustomerId: {
                not: null
              }
            },
            take: 1
          }
        },
      });
    } catch (error) {
      console.error(`Database error when fetching user: ${error}`);
      return NextResponse.json(
        { error: "Server Error", message: "Failed to fetch user data", code: "db_error" },
        { status: 500, headers }
      );
    }

    if (!user) {
      console.error(`User not found: ${session.user.id}`);
      return NextResponse.json(
        { error: "Not Found", message: "User not found", code: "user_not_found" },
        { status: 404, headers }
      );
    }

    // Get or create the Stripe customer
    let customerId = user.subscriptions[0]?.stripeCustomerId;

    if (!customerId) {
      console.log(`Creating new Stripe customer for user: ${user.id}`);
      
      try {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });

        customerId = customer.id;

        // Create a subscription record with the Stripe customer ID
        await prisma.subscription.create({
          data: {
            userId: user.id,
            status: "incomplete",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            stripeCustomerId: customerId,
            stripePriceId: priceId,
            plan: "pro",
            interval: "monthly", // Default, will be updated by webhook
          },
        });
      } catch (error) {
        console.error("Error creating Stripe customer or subscription record:", error);
        return NextResponse.json(
          { error: "Stripe Error", message: "Failed to create customer", code: "stripe_error" },
          { status: 500, headers }
        );
      }
    }

    // Create the checkout session URLs
    const successUrl = absoluteUrl(`/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    const cancelUrl = absoluteUrl(`/checkout/cancel`);

    console.log("Creating checkout session with:", {
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    });

    // Create the checkout session
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user.id,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      });
    } catch (error) {
      console.error("Stripe checkout session creation error:", error);
      // Define a proper type for Stripe errors
      interface StripeError {
        message?: string;
        code?: string;
        type?: string;
        param?: string;
      }
      const stripeError = error as StripeError;
      return NextResponse.json(
        { 
          error: "Stripe Error", 
          message: stripeError.message || "Failed to create checkout session", 
          code: stripeError.code || "stripe_error",
          details: process.env.NODE_ENV === "development" ? stripeError : undefined
        },
        { status: 500, headers }
      );
    }

    if (!checkoutSession.url) {
      console.error("Failed to create checkout session URL");
      return NextResponse.json(
        { error: "Checkout Error", message: "Failed to create checkout session", code: "checkout_error" },
        { status: 500, headers }
      );
    }

    console.log(`Checkout session created: ${checkoutSession.id}`);
    return NextResponse.json({ url: checkoutSession.url }, { headers });
  } catch (error) {
    console.error("Subscription API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: "Server Error", message: errorMessage, code: "server_error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET() {
  try {
    // Get the authenticated user's session - fixed for App Router
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "You must be logged in to view subscriptions",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ status: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("Error in GET /api/subscriptions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
