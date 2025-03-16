import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view payment methods" },
        { status: 401 }
      );
    }

    // Get the user's Stripe customer ID from the Subscription table
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!subscription?.stripeCustomerId) {
      // User doesn't have a Stripe customer ID yet
      return NextResponse.json({ paymentMethods: [] });
    }

    // Fetch payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: "card",
    });

    // Format the payment methods for the client
    const formattedPaymentMethods = paymentMethods.data.map((method) => {
      if (method.type !== "card" || !method.card) {
        return null;
      }

      return {
        id: method.id,
        brand: method.card.brand,
        last4: method.card.last4,
        expiryMonth: method.card.exp_month,
        expiryYear: method.card.exp_year,
        isDefault: method.metadata?.default === "true",
      };
    }).filter(Boolean);

    return NextResponse.json({ paymentMethods: formattedPaymentMethods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
