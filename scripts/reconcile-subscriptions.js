/**
 * Subscription Reconciliation Script
 * 
 * This script reconciles subscriptions between the database and Stripe.
 * It ensures that all active Stripe subscriptions have corresponding database records
 * and that subscription statuses match between the two systems.
 * 
 * Usage: node scripts/reconcile-subscriptions.js [--fix] [--verbose]
 * Options:
 *   --fix      Apply fixes to the database (default: dry run only)
 *   --verbose  Show detailed logs
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Import required dependencies
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = !args.includes('--fix');
const isVerbose = args.includes('--verbose');

// Helper function for logging
function log(message, data = null, level = 'info') {
  const timestamp = new Date().toISOString();
  
  if (level === 'info' && !isVerbose) {
    console.log(`[${timestamp}] ${message}`);
    return;
  }
  
  if (level === 'verbose' && !isVerbose) {
    return;
  }
  
  if (data) {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Main reconciliation function
 */
async function reconcileSubscriptions() {
  log('Starting subscription reconciliation');
  log(`Mode: ${shouldFix ? 'DRY RUN' : 'FIX'} (use --fix to apply changes)`, null, 'verbose');
  
  try {
    // Step 1: Get all subscriptions from Stripe
    log('Fetching subscriptions from Stripe...');
    const stripeSubscriptions = await fetchAllStripeSubscriptions();
    log(`Found ${stripeSubscriptions.length} subscriptions in Stripe`, null, 'verbose');
    
    // Step 2: Get all subscriptions from the database
    log('Fetching subscriptions from database...');
    const dbSubscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    log(`Found ${dbSubscriptions.length} subscriptions in database`, null, 'verbose');
    
    // Step 3: Create maps for easier lookup
    const stripeSubMap = new Map();
    stripeSubscriptions.forEach(sub => {
      stripeSubMap.set(sub.id, sub);
    });
    
    const dbSubMap = new Map();
    dbSubscriptions.forEach(sub => {
      if (sub.stripeSubscriptionId) {
        dbSubMap.set(sub.stripeSubscriptionId, sub);
      }
    });
    
    // Step 4: Find subscriptions that exist in Stripe but not in the database
    const missingInDb = stripeSubscriptions.filter(stripeSub => {
      return !dbSubMap.has(stripeSub.id);
    });
    
    log(`Found ${missingInDb.length} subscriptions in Stripe but not in database`);
    
    // Step 5: Find subscriptions that exist in the database but not in Stripe
    const missingInStripe = dbSubscriptions.filter(dbSub => {
      return dbSub.stripeSubscriptionId && !stripeSubMap.has(dbSub.stripeSubscriptionId);
    });
    
    log(`Found ${missingInStripe.length} subscriptions in database but not in Stripe`);
    
    // Step 6: Find subscriptions with mismatched statuses
    const statusMismatches = dbSubscriptions.filter(dbSub => {
      if (!dbSub.stripeSubscriptionId) return false;
      
      const stripeSub = stripeSubMap.get(dbSub.stripeSubscriptionId);
      if (!stripeSub) return false;
      
      return dbSub.status !== stripeSub.status;
    });
    
    log(`Found ${statusMismatches.length} subscriptions with mismatched statuses`);
    
    // Step 7: Apply fixes if requested
    if (!shouldFix) {
      log('Applying fixes...');
      
      // Fix missing subscriptions in database
      for (const stripeSub of missingInDb) {
        await fixMissingInDatabase(stripeSub);
      }
      
      // Fix status mismatches
      for (const dbSub of statusMismatches) {
        await fixStatusMismatch(dbSub, stripeSubMap.get(dbSub.stripeSubscriptionId));
      }
      
      // Mark orphaned database subscriptions
      for (const dbSub of missingInStripe) {
        await markOrphanedSubscription(dbSub);
      }
      
      log('Fixes applied successfully');
    } else {
      log('Dry run completed. Use --fix to apply changes');
      
      // Show details in verbose mode
      if (isVerbose) {
        if (missingInDb.length > 0) {
          log('Subscriptions missing in database:', missingInDb.map(sub => ({
            id: sub.id,
            customer: sub.customer,
            status: sub.status,
            metadata: sub.metadata,
          })), 'verbose');
        }
        
        if (statusMismatches.length > 0) {
          log('Status mismatches:', statusMismatches.map(dbSub => ({
            id: dbSub.id,
            stripeId: dbSub.stripeSubscriptionId,
            dbStatus: dbSub.status,
            stripeStatus: stripeSubMap.get(dbSub.stripeSubscriptionId).status,
            user: dbSub.user?.email || dbSub.userId,
          })), 'verbose');
        }
        
        if (missingInStripe.length > 0) {
          log('Orphaned database subscriptions:', missingInStripe.map(sub => ({
            id: sub.id,
            stripeId: sub.stripeSubscriptionId,
            status: sub.status,
            user: sub.user?.email || sub.userId,
          })), 'verbose');
        }
      }
    }
    
  } catch (error) {
    log('Error reconciling subscriptions', error, 'error');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch all subscriptions from Stripe
 */
async function fetchAllStripeSubscriptions() {
  const subscriptions = [];
  let hasMore = true;
  let startingAfter = null;
  
  while (hasMore) {
    const params = {
      limit: 100,
      expand: ['data.customer'],
    };
    
    if (startingAfter) {
      params.starting_after = startingAfter;
    }
    
    const result = await stripe.subscriptions.list(params);
    
    subscriptions.push(...result.data);
    hasMore = result.has_more;
    
    if (result.data.length > 0) {
      startingAfter = result.data[result.data.length - 1].id;
    } else {
      hasMore = false;
    }
  }
  
  return subscriptions;
}

/**
 * Fix a subscription that exists in Stripe but not in the database
 */
async function fixMissingInDatabase(stripeSub) {
  try {
    // Try to find the user ID from the subscription metadata
    let userId = stripeSub.metadata?.userId;
    
    // If not found in subscription metadata, try to find it in customer metadata
    if (!userId && stripeSub.customer) {
      const customerId = typeof stripeSub.customer === 'string' 
        ? stripeSub.customer 
        : stripeSub.customer.id;
      
      const customer = await stripe.customers.retrieve(customerId);
      userId = customer.metadata?.userId;
      
      // If still not found, try to find a user with matching email
      if (!userId && customer.email) {
        const user = await prisma.user.findFirst({
          where: { email: customer.email },
        });
        
        if (user) {
          userId = user.id;
          log(`Found user by email: ${customer.email}`, { userId }, 'verbose');
        }
      }
    }
    
    if (!userId) {
      log(`Cannot create subscription record: No userId found for Stripe subscription ${stripeSub.id}`, null, 'error');
      return;
    }
    
    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      log(`Cannot create subscription record: User ${userId} not found in database`, null, 'error');
      return;
    }
    
    // Create the subscription record
    const subscriptionItem = stripeSub.items.data[0];
    const priceId = subscriptionItem.price.id;
    
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        plan: stripeSub.metadata?.plan || 'pro',
        interval: stripeSub.metadata?.interval || 'monthly',
        stripeSubscriptionId: stripeSub.id,
        stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        status: stripeSub.status,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
    
    log(`Created missing subscription record for ${stripeSub.id}`, {
      userId,
      subscriptionId: newSubscription.id,
      status: newSubscription.status,
    });
    
  } catch (error) {
    log(`Error fixing missing subscription ${stripeSub.id} in database`, error, 'error');
  }
}

/**
 * Fix a subscription with mismatched status between Stripe and the database
 */
async function fixStatusMismatch(dbSub, stripeSub) {
  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { id: dbSub.id },
      data: {
        status: stripeSub.status,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });
    
    log(`Updated subscription status for ${dbSub.stripeSubscriptionId}`, {
      subscriptionId: dbSub.id,
      oldStatus: dbSub.status,
      newStatus: stripeSub.status,
      userId: dbSub.userId,
    });
    
    return updatedSubscription;
  } catch (error) {
    log(`Error fixing status mismatch for subscription ${dbSub.id}`, error, 'error');
  }
}

/**
 * Mark a subscription that exists in the database but not in Stripe
 */
async function markOrphanedSubscription(dbSub) {
  try {
    // Update the subscription status to indicate it's orphaned
    const updatedSubscription = await prisma.subscription.update({
      where: { id: dbSub.id },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
      },
    });
    
    log(`Marked orphaned subscription ${dbSub.id}`, {
      stripeId: dbSub.stripeSubscriptionId,
      userId: dbSub.userId,
    });
    
    return updatedSubscription;
  } catch (error) {
    log(`Error marking orphaned subscription ${dbSub.id}`, error, 'error');
  }
}

// Run the reconciliation
reconcileSubscriptions()
  .then(() => {
    log('Subscription reconciliation completed');
    process.exit(0);
  })
  .catch(error => {
    log('Subscription reconciliation failed', error, 'error');
    process.exit(1);
  });
