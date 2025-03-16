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
        { error: "You must be logged in to view invoices" },
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
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 100,
    });

    // Format the invoices for the client
    const formattedInvoices = invoices.data.map((invoice) => {
      return {
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid,
        status: invoice.status,
        date: new Date(invoice.created * 1000).toISOString(),
        url: invoice.hosted_invoice_url,
      };
    });

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
