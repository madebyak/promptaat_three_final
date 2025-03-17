// This script safely clears all subscription data from both the database and Stripe
// It first cancels subscriptions in Stripe, then removes them from the database
// Usage: NODE_ENV=development node -r dotenv/config scripts/clear-subscriptions.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Stripe = require('stripe');

// Make sure we have the Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
  console.error('Please run this script with environment variables loaded:');
  console.error('NODE_ENV=development node -r dotenv/config scripts/clear-subscriptions.js');
  process.exit(1);
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  console.log('Starting subscription cleanup process...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
  console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Set (hidden for security)' : 'Not set');
  
  try {
    // 1. Get all subscriptions from the database
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions in the database`);
    
    // 2. Process each subscription
    for (const subscription of subscriptions) {
      console.log(`\nProcessing subscription for user: ${subscription.user.email}`);
      console.log(`  ID: ${subscription.id}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Stripe Subscription ID: ${subscription.stripeSubscriptionId || 'None'}`);
      
      // 2a. If there's a Stripe subscription ID, cancel it in Stripe
      if (subscription.stripeSubscriptionId) {
        try {
          console.log(`  Attempting to cancel Stripe subscription: ${subscription.stripeSubscriptionId}`);
          
          // First check if the subscription exists and is not already canceled
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
          
          if (stripeSubscription.status !== 'canceled') {
            // Cancel the subscription immediately
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId, {
              invoice_now: false,
              prorate: false
            });
            console.log(`  Successfully canceled Stripe subscription`);
          } else {
            console.log(`  Stripe subscription already canceled`);
          }
        } catch (error) {
          if (error.code === 'resource_missing') {
            console.log(`  Stripe subscription not found (may have been deleted already)`);
          } else {
            console.error(`  Error canceling Stripe subscription:`, error.message);
          }
        }
      } else {
        console.log(`  No Stripe subscription ID to cancel`);
      }
      
      // 2b. Delete the subscription from the database
      try {
        await prisma.subscription.delete({
          where: { id: subscription.id }
        });
        console.log(`  Successfully deleted subscription from database`);
      } catch (error) {
        console.error(`  Error deleting subscription from database:`, error.message);
      }
    }
    
    // 3. Final verification
    const remainingSubscriptions = await prisma.subscription.count();
    console.log(`\nCleanup complete. Remaining subscriptions in database: ${remainingSubscriptions}`);
    
    if (remainingSubscriptions > 0) {
      console.log(`Some subscriptions could not be deleted. Please check the logs above for errors.`);
    } else {
      console.log(`All subscriptions have been successfully removed.`);
    }
    
  } catch (error) {
    console.error('Error during subscription cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
