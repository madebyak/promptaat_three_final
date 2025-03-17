const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function main() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'job@mindmuse.co' },
      include: {
        subscriptions: true
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    
    // Get customer's subscriptions from Stripe
    const stripeCustomerId = user.subscriptions[0]?.stripeCustomerId;
    
    if (!stripeCustomerId) {
      console.log('No Stripe customer ID found');
      return;
    }
    
    console.log(`Found Stripe customer ID: ${stripeCustomerId}`);
    
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      limit: 10,
    });
    
    if (subscriptions.data.length === 0) {
      console.log('No Stripe subscriptions found');
      return;
    }
    
    // Get the active Stripe subscription
    const stripeSubscription = subscriptions.data[0];
    console.log('Found Stripe subscription:', {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString()
    });
    
    // Get the subscription item and price details
    const subscriptionItem = stripeSubscription.items.data[0];
    const priceId = subscriptionItem.price.id;
    
    // Update the database subscription
    if (user.subscriptions.length > 0) {
      const dbSubscription = user.subscriptions[0];
      
      console.log('Updating subscription in database:', {
        id: dbSubscription.id,
        currentStatus: dbSubscription.status,
        newStatus: stripeSubscription.status
      });
      
      // Update the subscription with the Stripe data
      const updatedSubscription = await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer,
          stripePriceId: priceId,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          plan: stripeSubscription.metadata?.plan || "pro",
          interval: stripeSubscription.metadata?.interval || "monthly",
        },
      });
      
      console.log('Subscription updated successfully:', {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        stripeSubscriptionId: updatedSubscription.stripeSubscriptionId
      });
    } else {
      console.log('No database subscription found to update');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
