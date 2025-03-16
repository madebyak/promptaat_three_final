import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

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
    // Validate environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[API] Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json(
        {
          error: "Server configuration error",
          code: "missing_stripe_secret",
          message: "The Stripe secret key is not configured",
        },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error("[API] Missing NEXT_PUBLIC_APP_URL environment variable");
      return NextResponse.json(
        {
          error: "Server configuration error",
          code: "missing_app_url",
          message: "The application URL is not configured",
        },
        { status: 500 }
      );
    }

    // SIMPLIFIED SESSION RETRIEVAL - Focus on getting a valid session
    let session;
    
    try {
      // Get the authenticated user's session using App Router approach
      session = await getServerSession(authOptions);
      
      console.log("[API] Session check result:", { 
        hasSession: !!session, 
        hasUser: session ? !!session.user : false,
        userEmail: session?.user?.email ? `${session.user.email.substring(0, 3)}...` : null
      });
    } catch (error) {
      console.error("[API] Error retrieving session:", error);
      return NextResponse.json(
        {
          error: "Authentication error",
          code: "session_retrieval_error",
          message: "Failed to retrieve user session",
        },
        { status: 401 }
      );
    }

    // If no session is found, return unauthorized
    if (!session?.user) {
      console.error("[API] No authenticated user found");
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "unauthorized",
          message: "You must be logged in to create a subscription",
        },
        { status: 401 }
      );
    }

    // Parse the JSON body from the request
    const body = await req.json();
    console.log("[API] Request body:", body);

    // Validate the request body against our schema
    const subscriptionData = subscriptionCreateSchema.safeParse(body);
    let priceId = "";

    if (subscriptionData.success) {
      priceId = subscriptionData.data.priceId;
    } else {
      // Try parsing with the legacy schema as a fallback
      const legacyData = legacySubscriptionCreateSchema.safeParse(body);
      if (legacyData.success) {
        const { plan, interval } = legacyData.data;
        // Convert legacy format to priceId
        if (plan === "pro") {
          switch (interval) {
            case "monthly":
              priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || "";
              break;
            case "quarterly":
              priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY || "";
              break;
            case "annual":
              priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || "";
              break;
          }
        }
      } else {
        console.error("[API] Invalid request data:", body);
        return NextResponse.json(
          {
            error: "Invalid request",
            code: "invalid_request",
            message: "Missing or invalid price ID",
          },
          { status: 400 }
        );
      }
    }

    if (!priceId) {
      console.error("[API] Missing price ID");
      return NextResponse.json(
        {
          error: "Invalid request",
          code: "missing_price_id",
          message: "Price ID is required",
        },
        { status: 400 }
      );
    }

    // Get user ID and email from the session
    const userId = session.user.id;
    const email = session.user.email;

    if (!userId || !email) {
      console.error("[API] Missing user ID or email in session", { userId, email });
      return NextResponse.json(
        {
          error: "Invalid session",
          code: "invalid_session",
          message: "User ID and email are required",
        },
        { status: 400 }
      );
    }

    // Setup success and cancel URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/payment/canceled`;

    console.log("[API] Creating checkout session with:", {
      userId,
      email: email.substring(0, 3) + "...",
      priceId: priceId.substring(0, 10) + "...",
      successUrl,
      cancelUrl,
    });

    // Create a checkout session
    const checkoutSession = await createCheckoutSession({
      userId,
      email,
      priceId,
      successUrl,
      cancelUrl,
    });

    // Return the checkout session URL
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    // Handle any unexpected errors
    console.error("[API] Unhandled error in subscription creation:", error);
    
    // Enhanced error reporting
    let errorMessage = "An unexpected error occurred";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack?.substring(0, 500) // Limit stack trace length
      };
    }
    
    return NextResponse.json(
      {
        error: "Server error",
        code: "server_error",
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
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
