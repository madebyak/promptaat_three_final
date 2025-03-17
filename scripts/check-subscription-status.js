// check-subscription-status.js
// This script checks the current subscription status in the database
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';

// Initialize environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkSubscriptionStatus(email) {
  console.log(`Checking subscription status for email: ${email || 'all users'}`);
  
  try {
    // Query conditions
    const whereCondition = email 
      ? { user: { email } }
      : {};
    
    // Find subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (subscriptions.length === 0) {
      console.log('No subscriptions found');
      return;
    }
    
    console.log(`Found ${subscriptions.length} subscriptions:`);
    
    // Display subscription details
    for (const sub of subscriptions) {
      console.log('\n-----------------------------------');
      console.log(`User: ${sub.user.email}`);
      console.log(`Subscription ID: ${sub.id}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Stripe Subscription ID: ${sub.stripeSubscriptionId || 'Not set'}`);
      console.log(`Created: ${sub.createdAt}`);
      console.log(`Current Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`);
      
      // Check if we have a Stripe subscription ID
      if (sub.stripeSubscriptionId) {
        try {
          // Get subscription details from Stripe
          const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
          console.log('\nStripe Status:');
          console.log(`  Status: ${stripeSubscription.status}`);
          console.log(`  Cancel at period end: ${stripeSubscription.cancel_at_period_end}`);
          console.log(`  Current period end: ${new Date(stripeSubscription.current_period_end * 1000)}`);
        } catch (error) {
          console.log(`Error retrieving Stripe subscription: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking subscription status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args
const email = process.argv[2];

// Run the check
checkSubscriptionStatus(email)
  .then(() => console.log('\nScript completed'))
  .catch(error => console.error('Script failed:', error));
