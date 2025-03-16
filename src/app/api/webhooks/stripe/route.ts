import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Stripe } from "stripe";
import { stripe, handleStripeWebhook } from "@/lib/stripe";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
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
              } else {
                console.error("User not found in database", {
                  userId: customerUserId,
                });
              }
            } else {
              console.error("No userId found in customer metadata", {
                customerId: subscription.customer,
              });
            }
          } catch (error) {
            console.error("Error retrieving customer:", error);
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
          return;
        }
        
        await createOrUpdateSubscription(subscription, userId);
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
            });
            
            const userSubscription = await prisma.subscription.findFirst({
              where: { userId },
            });
            
            if (userSubscription) {
              console.log("Found subscription by userId", {
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
          
          console.error("Could not find subscription by any means", {
            stripeSubscriptionId: subscription.id,
            metadata: subscription.metadata,
          });
          
          return;
        }
        
        // Get the subscription item and price details
        const subscriptionItem = subscription.items.data[0];
        const priceId = subscriptionItem.price.id;
        
        // Update the subscription in the database
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            stripePriceId: priceId,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            plan: subscription.metadata?.plan || existingSubscription.plan || "pro",
            interval: subscription.metadata?.interval || existingSubscription.interval || "monthly",
          },
        });
        
        console.log("Successfully updated subscription", {
          subscriptionId: existingSubscription.id,
          userId: existingSubscription.userId,
          newStatus: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
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
    console.error("Error handling webhook event:", error);
    return NextResponse.json(
      { error: "Failed to handle webhook" },
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
          status: subscription.status,
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
          status: subscription.status,
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
    console.error("Error creating/updating subscription:", error);
    throw error;
  }
}
