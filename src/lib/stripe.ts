import { Stripe } from "stripe";

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Updated to match the version used by Stripe CLI
  typescript: true,
});

// Define the subscription price IDs
// These should be created in the Stripe dashboard and referenced here
export const STRIPE_PRICE_IDS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
    quarterly: process.env.STRIPE_PRICE_ID_PRO_QUARTERLY || "",
    annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "",
  },
};

// Helper function to get the price ID based on plan and interval
export function getPriceId(plan: string, interval: string): string {
  if (plan === "pro") {
    if (interval === "monthly") return STRIPE_PRICE_IDS.pro.monthly;
    if (interval === "quarterly") return STRIPE_PRICE_IDS.pro.quarterly;
    if (interval === "annual") return STRIPE_PRICE_IDS.pro.annual;
  }
  
  throw new Error(`Invalid plan (${plan}) or interval (${interval})`);
}

// Create a Stripe checkout session
export async function createCheckoutSession({
  userId,
  email,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  // Validate that we have a valid price ID
  if (!priceId) {
    throw new Error(`No price ID provided`);
  }
  
  // First, check if a customer already exists for this user
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });
  
  let customerId: string;
  
  // If customer exists, use that customer
  if (existingCustomers.data.length > 0) {
    customerId = existingCustomers.data[0].id;
    
    // Update the customer metadata to include userId if it's not already there
    if (!existingCustomers.data[0].metadata?.userId) {
      await stripe.customers.update(customerId, {
        metadata: {
          userId: userId,
        },
      });
    }
  } else {
    // Create a new customer with the userId in metadata
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
      },
    });
    
    customerId = customer.id;
  }
  
  try {
    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      customer: customerId, // Use the customer ID instead of email
      client_reference_id: userId,
      payment_method_types: ["card"],
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
        userId,
      },
      subscription_data: {
        metadata: {
          userId: userId, // Add userId to subscription metadata directly
        },
      },
    });
    
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Create a Stripe portal session for managing subscriptions
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return session;
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw error;
  }
}

// Cancel a subscription but maintain access until the end of the current billing period
export async function cancelSubscription({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  try {
    // Cancel the subscription at the end of the current period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    
    return {
      success: true,
      subscription,
      message: "Subscription will be canceled at the end of the billing period",
    };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

// Reactivate a canceled subscription if it hasn't expired yet
export async function reactivateSubscription({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  try {
    // Remove the cancellation at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    
    return {
      success: true,
      subscription,
      message: "Subscription has been reactivated",
    };
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw error;
  }
}

// Handle Stripe webhook events
export async function handleStripeWebhook({
  event,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionCancelled,
}: {
  event: Stripe.Event;
  handleSubscriptionCreated: (subscription: Stripe.Subscription) => Promise<void>;
  handleSubscriptionUpdated: (subscription: Stripe.Subscription) => Promise<void>;
  handleSubscriptionCancelled: (subscription: Stripe.Subscription) => Promise<void>;
}) {
  const subscription = event.data.object as Stripe.Subscription;
  
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(subscription);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(subscription);
      break;
  }
}

// Check if a user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: "active" },
          { status: "trialing" },
          {
            status: "canceled",
            cancelAtPeriodEnd: true,
            currentPeriodEnd: {
              gt: new Date(),
            },
          },
        ],
      },
    });
    
    return !!subscription;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

// Import prisma client for subscription status checks
import { prisma } from "@/lib/prisma/client";
