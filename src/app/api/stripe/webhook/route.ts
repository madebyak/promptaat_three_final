import { NextRequest, NextResponse } from "next/server";
import { stripe, handleStripeWebhook } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { createOrUpdateSubscription } from "@/app/api/webhooks/stripe/route";

// This is your Stripe webhook secret for testing your endpoint locally.
// For local development with Stripe CLI, use the webhook secret provided by the CLI
// In production, use the secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * IMPORTANT: This route exists for backward compatibility with the Stripe dashboard
 * configuration that sends webhooks to /api/stripe/webhook.
 * 
 * The main webhook handler is now at /api/webhooks/stripe.
 * 
 * This handler processes the events and then calls the same helper functions
 * that the main webhook handler uses.
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[OLD_WEBHOOK] Received webhook request at /api/stripe/webhook");
    // Create a copy of the request with new URL for logging
    const body = await req.text();
    // Get the stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error("[OLD_WEBHOOK] Missing stripe-signature or webhook secret");
      return NextResponse.json(
        { error: "Missing stripe-signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify the event came from Stripe
    let event: Stripe.Event;
    try {
      console.log("[OLD_WEBHOOK] Verifying webhook signature with secret:", webhookSecret.substring(0, 5) + "...");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("[OLD_WEBHOOK] Signature verification successful");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[OLD_WEBHOOK] Signature verification failed: ${errorMessage}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log(`[OLD_WEBHOOK] Event received: ${event.type}`);

    // Handle the event using the same handler as the new webhook endpoint
    await handleStripeWebhook({
      event,
      handleSubscriptionCreated: async (subscription) => {
        console.log("[OLD_WEBHOOK] Processing subscription created event:", subscription.id);
        
        // Try to get userId from the subscription metadata directly
        let userId = subscription.metadata?.userId;
        console.log("[OLD_WEBHOOK] User ID from subscription metadata:", userId || "None");
        
        if (!userId && userId !== subscription.metadata?.user_id) {
          console.log("[OLD_WEBHOOK] Checking alternative userId format in metadata");
          userId = subscription.metadata?.user_id;
          console.log("[OLD_WEBHOOK] Alternative user ID from subscription metadata:", userId || "None");
        }

        // If userId is not in subscription metadata, try to get it from the customer
        if (!userId) {
          try {
            // Get the customer to find client_reference_id or metadata
            const customer = await stripe.customers.retrieve(
              typeof subscription.customer === 'string' 
                ? subscription.customer 
                : subscription.customer.id
            );
            
            if (customer && !customer.deleted) {
              // Check customer metadata for userId
              userId = customer.metadata?.userId;
              console.log("[OLD_WEBHOOK] User ID from customer metadata:", userId || "None");
              
              if (!userId) {
                // Look for any recent checkout sessions for this customer
                const sessions = await stripe.checkout.sessions.list({
                  customer: customer.id,
                  limit: 5,
                });
                
                // Find a session with client_reference_id (which is our userId)
                const session = sessions.data.find(s => s.client_reference_id);
                if (session && session.client_reference_id) {
                  userId = session.client_reference_id;
                  console.log(`[OLD_WEBHOOK] Found userId ${userId} from checkout session client_reference_id`);
                }
              } else {
                console.log(`[OLD_WEBHOOK] Found userId ${userId} from customer metadata`);
              }
            }
          } catch (error) {
            console.error("[OLD_WEBHOOK] Error retrieving customer information:", error);
          }
        }

        if (!userId) {
          console.log("[OLD_WEBHOOK] No userId found in subscription metadata or customer data.");
          // Check client_reference_id directly from the session in case of checkout.session.completed event
          if (event.type === 'checkout.session.completed' && event.data.object.client_reference_id) {
            userId = event.data.object.client_reference_id;
            console.log(`[OLD_WEBHOOK] Found userId ${userId} from checkout session client_reference_id`);
          } else {
            console.log("[OLD_WEBHOOK] Unable to determine userId for this subscription");
            return;
          }
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          console.log(`[OLD_WEBHOOK] User with ID ${userId} not found in database`);
          return;
        }

        try {
          // Use the centralized function to create or update subscription
          await createOrUpdateSubscription(subscription, userId);
          console.log("[OLD_WEBHOOK] Successfully processed subscription");
        } catch (error) {
          console.error("[OLD_WEBHOOK] Error creating/updating subscription:", error);
        }
      },
      
      handleSubscriptionUpdated: async (subscription) => {
        console.log("[OLD_WEBHOOK] Processing subscription updated event:", subscription.id);
        
        // Find the subscription in the database by Stripe subscription ID
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { id: subscription.id }
            ]
          },
        });
        
        if (!existingSubscription) {
          console.error("[OLD_WEBHOOK] Subscription not found in database:", subscription.id);
          
          // Try to find by userId in metadata as fallback
          if (subscription.metadata?.userId) {
            const userId = subscription.metadata.userId;
            console.log("[OLD_WEBHOOK] Attempting to find subscription by userId from metadata", {
              userId,
            });
            
            const userSubscription = await prisma.subscription.findFirst({
              where: { userId },
            });
            
            if (userSubscription) {
              console.log("[OLD_WEBHOOK] Found subscription by userId", {
                subscriptionId: userSubscription.id,
                userId,
              });
              
              // Update the subscription with the Stripe subscription ID
              await prisma.subscription.update({
                where: { id: userSubscription.id },
                data: {
                  stripeSubscriptionId: subscription.id,
                  stripeCustomerId: subscription.customer as string,
                  stripePriceId: subscription.items.data[0].price.id,
                  currentPeriodStart: new Date(subscription.current_period_start * 1000),
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  status: subscription.status,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  plan: subscription.metadata?.plan || "pro",
                  interval: subscription.metadata?.interval || "monthly",
                },
              });
              
              return;
            }
          }
          
          console.error("[OLD_WEBHOOK] Could not find subscription by any means", {
            stripeSubscriptionId: subscription.id,
            metadata: subscription.metadata,
          });
          
          return;
        }
        
        try {
          // Get the subscription item and price details
          const subscriptionItem = subscription.items.data[0];
          const priceId = subscriptionItem.price.id;
          
          // Update the subscription in the database
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: priceId,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              plan: subscription.metadata?.plan || existingSubscription.plan || "pro",
              interval: subscription.metadata?.interval || existingSubscription.interval || "monthly",
            },
          });
          console.log("[OLD_WEBHOOK] Successfully updated subscription");
        } catch (error) {
          console.error("[OLD_WEBHOOK] Error updating subscription:", error);
        }
      },
      
      handleSubscriptionCancelled: async (subscription) => {
        console.log("[OLD_WEBHOOK] Processing subscription cancelled event:", subscription.id);
        
        // Find the subscription in the database by Stripe subscription ID
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { id: subscription.id }
            ]
          },
        });
        
        if (!existingSubscription) {
          console.error("[OLD_WEBHOOK] Subscription not found for cancellation:", subscription.id);
          return;
        }
        
        try {
          // Update the subscription status in the database
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: "canceled",
              cancelAtPeriodEnd: false,
            },
          });
          console.log("[OLD_WEBHOOK] Successfully cancelled subscription");
        } catch (error) {
          console.error("[OLD_WEBHOOK] Error cancelling subscription:", error);
        }
      },
    });
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("[OLD_WEBHOOK] Error handling webhook event:", error);
    return NextResponse.json(
      { error: "Failed to handle webhook" },
      { status: 500 }
    );
  }
}
