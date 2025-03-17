// cleanup-subscriptions.js
// This script removes all subscription data from the database
// while preserving Stripe products and customers
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Initialize environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function cleanupSubscriptions() {
  console.log('Starting subscription cleanup...');
  
  try {
    // 1. First, cancel all active subscriptions in Stripe
    console.log('Fetching subscriptions from Stripe...');
    const stripeSubscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'active',
    });
    
    console.log(`Found ${stripeSubscriptions.data.length} active subscriptions in Stripe`);
    
    // Cancel each subscription in Stripe
    for (const subscription of stripeSubscriptions.data) {
      console.log(`Canceling Stripe subscription: ${subscription.id}`);
      try {
        await stripe.subscriptions.cancel(subscription.id);
        console.log(`Successfully canceled subscription: ${subscription.id}`);
      } catch (error) {
        console.error(`Error canceling subscription ${subscription.id}:`, error);
      }
    }
    
    // 2. Delete all subscription records from the database
    console.log('\nDeleting subscription records from database...');
    const result = await prisma.subscription.deleteMany({});
    console.log(`Deleted ${result.count} subscription records from database`);
    
    // 3. Summary
    console.log('\nCleanup complete!');
    console.log('You can now retest the subscription flow with existing accounts');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupSubscriptions()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
