import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a checkout session" },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await req.json();
    const { plan, interval, locale } = body;
    
    if (!plan || !interval) {
      return NextResponse.json(
        { error: "Plan and interval are required" },
        { status: 400 }
      );
    }
    
    // Create success and cancel URLs
    const successUrl = absoluteUrl(`/${locale}/checkout/success`);
    const cancelUrl = absoluteUrl(`/${locale}/checkout/cancel`);
    
    // Create the checkout session
    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email || "",
      plan,
      interval,
      successUrl,
      cancelUrl,
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the checkout session" },
      { status: 500 }
    );
  }
}
