import { Stripe } from "stripe";

// Initialize Stripe with the secret key from environment variables
// Only initialize Stripe on the server side
let stripeInstance: Stripe | null = null;

export const getStripe = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe can only be initialized on the server side');
  }
  
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    
    stripeInstance = new Stripe(secretKey, {
      // @ts-expect-error - Using an updated API version
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }
  
  return stripeInstance;
};

// Export a function to safely get the Stripe instance
export const stripe = getStripe();

// Define the subscription price IDs
// These should be created in the Stripe dashboard and referenced here
export const STRIPE_PRICE_IDS = {
  pro: {
    // Use the NEXT_PUBLIC_ prefixed variables to ensure consistency with client-side
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
    quarterly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY || process.env.STRIPE_PRICE_ID_PRO_QUARTERLY || "",
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL || process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "",
  },
};

// Helper function to get the price ID based on plan and interval
export function getPriceId(plan: string, interval: string): string {
  if (plan === "pro") {
    return STRIPE_PRICE_IDS.pro[interval as keyof typeof STRIPE_PRICE_IDS.pro] || "";
  }
  return "";
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
  
  console.log(`[Stripe] Creating checkout session for price ID: ${priceId}`);
  console.log(`[Stripe] User ID: ${userId}, Email: ${email}`);
  console.log(`[Stripe] Success URL: ${successUrl}, Cancel URL: ${cancelUrl}`);
  
  try {
    // First, check if a customer already exists for this user
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    
    let customerId: string;
    
    // If customer exists, use that customer
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log(`[Stripe] Using existing customer: ${customerId}`);
      
      // Update the customer metadata to include userId if it's not already there
      if (!existingCustomers.data[0].metadata?.userId) {
        await stripe.customers.update(customerId, {
          metadata: {
            userId: userId,
          },
        });
        console.log(`[Stripe] Updated customer metadata with userId: ${userId}`);
      }
    } else {
      // Create a new customer with the userId in metadata
      console.log(`[Stripe] Creating new customer for email: ${email}`);
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
      
      customerId = customer.id;
      console.log(`[Stripe] Created new customer: ${customerId}`);
    }
    
    try {
      // Create a checkout session with Stripe
      console.log(`[Stripe] Creating checkout session with price ID: ${priceId}`);
      
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
      
      console.log(`[Stripe] Checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      console.error("[Stripe] Error creating checkout session:", error);
      
      // Log detailed information about the error
      if (error instanceof Error) {
        console.error("[Stripe] Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      // If it's a Stripe error, log additional details
      if (error && typeof error === 'object' && 'type' in error) {
        const stripeError = error as unknown as {
          type: string;
          code?: string;
          param?: string;
          statusCode?: number;
          raw?: unknown;
        };
        console.error("[Stripe] Stripe error details:", {
          type: stripeError.type,
          code: stripeError.code,
          param: stripeError.param,
          statusCode: stripeError.statusCode,
          raw: stripeError.raw
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error("[Stripe] Error in createCheckoutSession:", error);
    
    // Log detailed information about the error
    if (error instanceof Error) {
      console.error("[Stripe] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
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
  console.log(`Processing Stripe webhook event: ${event.type}`, {
    eventId: event.id,
    eventType: event.type,
    timestamp: new Date().toISOString(),
  });

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed":
        // Handle checkout session completed event
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process subscription-mode checkout sessions
        if (session.mode === 'subscription' && session.subscription) {
          console.log(`Processing checkout.session.completed with subscription: ${session.subscription}`, {
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription,
            paymentStatus: session.payment_status,
          });
          
          try {
            // Retrieve the subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            console.log(`Retrieved subscription details from Stripe`, {
              subscriptionId: subscription.id,
              status: subscription.status,
              customerId: subscription.customer,
            });
            
            // Process the subscription created event
            await handleSubscriptionCreated(subscription);
            console.log(`Successfully processed subscription from checkout session`, {
              sessionId: session.id,
              subscriptionId: subscription.id,
            });
          } catch (error: Error | unknown) {
            console.error(`Error processing checkout.session.completed event:`, error);
            // Rethrow the error to be caught by the outer try-catch
            throw new Error(`Failed to process checkout session: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          console.log(`Skipping non-subscription checkout session`, {
            sessionId: session.id,
            mode: session.mode,
          });
        }
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: Error | unknown) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    // Rethrow the error to be handled by the route handler
    throw error;
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
