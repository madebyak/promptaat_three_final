import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Stripe } from "stripe";
import { stripe, handleStripeWebhook } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  try {
    // Get the raw request body as a string
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    
    console.log("[Stripe Webhook] Received webhook event with signature:", signature.substring(0, 10) + "...");
    console.log("[Stripe Webhook] Request body preview:", body.substring(0, 100) + "...");
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not defined");
      return NextResponse.json(
        { error: "Webhook secret is not configured" },
        { status: 500 }
      );
    }
    
    // Verify the webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(`[Stripe Webhook] Event verified: ${event.type}`, {
        eventId: event.id,
        objectType: event.data.object.object,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Stripe Webhook] Webhook signature verification failed: ${error.message}`);
        return NextResponse.json(
          { error: `Webhook signature verification failed: ${error.message}` },
          { status: 400 }
        );
      } else {
        console.error("[Stripe Webhook] Unknown error during webhook verification:", error);
        return NextResponse.json(
          { error: "Webhook verification failed" },
          { status: 400 }
        );
      }
    }
    
    // Handle checkout.session.completed events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('[Stripe Webhook] Checkout session data:', {
        id: session.id,
        mode: session.mode,
        paymentStatus: session.payment_status,
        subscriptionId: session.subscription,
        metadata: session.metadata,
      });
      
      // Only process subscription checkouts
      if (session.mode === 'subscription' && session.subscription) {
        console.log('[Stripe Webhook] Processing checkout.session.completed event for subscription', {
          sessionId: session.id,
          subscriptionId: session.subscription,
          userId: session.metadata?.userId,
        });
        
        try {
          // Fetch the subscription details from Stripe
          console.log(`[Stripe Webhook] Retrieving subscription details for: ${session.subscription}`);
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          console.log('[Stripe Webhook] Retrieved subscription details:', {
            id: subscription.id,
            status: subscription.status,
            customerId: subscription.customer,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          });
          
          // Get the user ID from metadata
          const userId = session.metadata?.userId;
          
          if (!userId) {
            console.error('[Stripe Webhook] No userId in session metadata', {
              sessionId: session.id,
              subscriptionId: session.subscription,
            });
            return NextResponse.json(
              { error: "No userId found in session metadata" },
              { status: 400 }
            );
          }
          
          // Create or update the subscription in the database
          console.log(`[Stripe Webhook] Calling createOrUpdateSubscription for user: ${userId}`);
          await createOrUpdateSubscription(subscription, userId);
          
          console.log('[Stripe Webhook] Successfully processed checkout session and updated subscription', {
            subscriptionId: subscription.id,
            status: subscription.status.toLowerCase(),
            userId,
          });
        } catch (error) {
          console.error('[Stripe Webhook] Error processing checkout session', error);
          return NextResponse.json(
            { error: "Failed to process checkout session" },
            { status: 500 }
          );
        }
      }
    } else {
      // Process other Stripe events using the existing handler
      const headersList = await headers();
      const signature = headersList.get("stripe-signature");
      
      if (!signature) {
        console.error("Missing Stripe signature in webhook request");
        return NextResponse.json(
          { error: "Missing Stripe signature" },
          { status: 400 }
        );
      }
      
      let event: Stripe.Event;
      
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (error) {
        console.error("Error verifying webhook signature:", error);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
      
      try {
        console.log(`Processing Stripe webhook event: ${event.type}`, {
          id: event.id,
          type: event.type,
          object: event.data.object.object,
          timestamp: new Date().toISOString(),
        });
        
        await handleStripeWebhook({
          event,
          // Handle subscription created event
          handleSubscriptionCreated: async (subscription) => {
            console.log("Processing subscription created event", {
              subscriptionId: subscription.id,
              metadata: subscription.metadata,
              customerId: subscription.customer,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            });
            
            const userId = subscription.metadata?.userId;
            
            if (!userId) {
              console.error("No userId found in subscription metadata", {
                subscriptionId: subscription.id,
                metadata: subscription.metadata,
              });
              
              // Try to get userId from customer metadata as fallback
              try {
                const customer = await stripe.customers.retrieve(subscription.customer as string);
                if (customer && !customer.deleted && customer.metadata?.userId) {
                  console.log("Found userId in customer metadata", {
                    customerId: customer.id,
                    userId: customer.metadata.userId,
                  });
                  
                  // Use the userId from customer metadata
                  const customerUserId = customer.metadata.userId;
                  
                  // Check if this user exists in our database
                  const user = await prisma.user.findUnique({
                    where: { id: customerUserId },
                  });
                  
                  if (user) {
                    await createOrUpdateSubscription(subscription, customerUserId);
                    console.log("Successfully created/updated subscription using customer metadata userId", {
                      userId: customerUserId,
                      subscriptionId: subscription.id,
                    });
                  } else {
                    console.error("User not found in database", {
                      userId: customerUserId,
                    });
                    throw new Error(`User not found in database: ${customerUserId}`);
                  }
                } else {
                  console.error("No userId found in customer metadata", {
                    customerId: subscription.customer,
                  });
                  throw new Error(`No userId found in customer metadata: ${subscription.customer}`);
                }
              } catch (error) {
                console.error("Error retrieving customer:", error);
                throw error;
              }
              
              return;
            }
            
            // Check if this user exists in our database
            const user = await prisma.user.findUnique({
              where: { id: userId },
            });
            
            if (!user) {
              console.error("User not found in database", {
                userId,
              });
              throw new Error(`User not found in database: ${userId}`);
            }
            
            await createOrUpdateSubscription(subscription, userId);
            console.log("Successfully created/updated subscription", {
              userId,
              subscriptionId: subscription.id,
            });
          },
          
          // Handle subscription updated event
          handleSubscriptionUpdated: async (subscription) => {
            console.log("Processing subscription updated event", {
              subscriptionId: subscription.id,
              status: subscription.status,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            });
            
            // Find the subscription in the database by Stripe subscription ID
            const existingSubscription = await prisma.subscription.findFirst({
              where: {
                stripeSubscriptionId: subscription.id
              },
            });
            
            if (!existingSubscription) {
              console.error("Subscription not found in database:", subscription.id);
              
              // Try to find by userId in metadata as fallback
              if (subscription.metadata?.userId) {
                const userId = subscription.metadata.userId;
                console.log("Attempting to find subscription by userId from metadata", {
                  userId,
                  subscriptionId: subscription.id,
                });
                
                const userSubscription = await prisma.subscription.findFirst({
                  where: { userId },
                });
                
                if (userSubscription) {
                  console.log("Found subscription by userId", {
                    subscriptionId: userSubscription.id,
                    userId,
                  });
                  
                  try {
                    // Update the subscription with the Stripe subscription ID
                    const updatedSubscription = await prisma.subscription.update({
                      where: { id: userSubscription.id },
                      data: {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        stripePriceId: subscription.items.data[0].price.id,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        status: subscription.status.toLowerCase(), // Convert to lowercase
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        plan: subscription.metadata?.plan || "pro",
                        interval: subscription.metadata?.interval || "monthly",
                      },
                    });
                    
                    console.log("Successfully updated subscription by userId", {
                      subscriptionId: updatedSubscription.id,
                      userId,
                      status: updatedSubscription.status,
                    });
                    
                    return;
                  } catch (error) {
                    console.error("Error updating subscription by userId:", error);
                    throw error;
                  }
                } else {
                  console.error("No subscription found for userId", {
                    userId,
                    subscriptionId: subscription.id,
                  });
                  
                  // Create a new subscription as fallback
                  try {
                    console.log("Creating new subscription for user", {
                      userId,
                      subscriptionId: subscription.id,
                    });
                    
                    await createOrUpdateSubscription(subscription, userId);
                    
                    console.log("Successfully created new subscription for user", {
                      userId,
                      subscriptionId: subscription.id,
                    });
                    
                    return;
                  } catch (error) {
                    console.error("Error creating new subscription:", error);
                    throw error;
                  }
                }
              }
              
              console.error("Could not find subscription by any means", {
                stripeSubscriptionId: subscription.id,
                metadata: subscription.metadata,
              });
              
              throw new Error(`Subscription not found in database and no userId in metadata: ${subscription.id}`);
            }
            
            // Get the subscription item and price details
            const subscriptionItem = subscription.items.data[0];
            const priceId = subscriptionItem.price.id;
            
            try {
              // Update the subscription in the database
              const updatedSubscription = await prisma.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  stripePriceId: priceId,
                  currentPeriodStart: new Date(subscription.current_period_start * 1000),
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  status: subscription.status.toLowerCase(), // Convert to lowercase
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
              });
              
              console.log("Successfully updated subscription", {
                subscriptionId: updatedSubscription.id,
                status: updatedSubscription.status,
                userId: updatedSubscription.userId,
              });
            } catch (error) {
              if (error instanceof Error) {
                console.error("Error updating subscription:", error);
                throw new Error(`Failed to update subscription: ${error.message}`);
              } else {
                console.error("Unknown error updating subscription:", error);
                throw new Error("Failed to update subscription: Unknown error");
              }
            }
          },
          
          // Handle subscription cancelled event
          handleSubscriptionCancelled: async (subscription) => {
            console.log("Processing subscription cancelled event", {
              subscriptionId: subscription.id,
              status: subscription.status,
              cancelReason: subscription.cancellation_details?.reason || "unknown",
            });
            
            // Find the subscription in the database by Stripe subscription ID
            const existingSubscription = await prisma.subscription.findFirst({
              where: {
                stripeSubscriptionId: subscription.id
              },
            });
            
            if (!existingSubscription) {
              console.error("Subscription not found for cancellation:", subscription.id);
              return;
            }
            
            // Update the subscription status in the database
            await prisma.subscription.update({
              where: { id: existingSubscription.id },
              data: {
                status: "canceled",
                cancelAtPeriodEnd: false,
              },
            });
            
            console.log("Successfully marked subscription as canceled", {
              subscriptionId: existingSubscription.id,
              userId: existingSubscription.userId,
            });
          },
        });
        
        return NextResponse.json({ received: true });
        
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error handling webhook event:", error);
          return NextResponse.json(
            { error: "Failed to handle webhook" },
            { status: 500 }
          );
        } else {
          console.error("Unknown error handling webhook event:", error);
          return NextResponse.json(
            { error: "Failed to handle webhook" },
            { status: 500 }
          );
        }
      }
    }
  } catch (error) {
    console.error("Error handling webhook request:", error);
    return NextResponse.json(
      { error: "Failed to handle webhook request" },
      { status: 500 }
    );
  }
}

// Helper function to create or update a subscription
export async function createOrUpdateSubscription(subscription: Stripe.Subscription, userId: string) {
  const subscriptionItem = subscription.items.data[0];
  const priceId = subscriptionItem.price.id;
  
  // Determine the plan and interval from the metadata
  const plan = subscription.metadata?.plan || "pro";
  const interval = subscription.metadata?.interval || "monthly";
  
  try {
    // Find existing subscription for this user
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId },
    });
    
    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan,
          interval,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: priceId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status.toLowerCase(), // Convert to lowercase
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      
      console.log("Updated existing subscription", {
        subscriptionId: existingSubscription.id,
        userId,
        status: subscription.status,
      });
    } else {
      // Create new subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          plan,
          interval,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: priceId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status.toLowerCase(), // Convert to lowercase
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
      
      console.log("Created new subscription", {
        subscriptionId: newSubscription.id,
        userId,
        status: subscription.status,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating/updating subscription:", error);
      throw error;
    } else {
      console.error("Unknown error creating/updating subscription:", error);
      throw new Error("Failed to create/update subscription: Unknown error");
    }
  }
}
