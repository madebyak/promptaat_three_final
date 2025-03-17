import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16' as Stripe.LatestApiVersion,
});

/**
 * API route for reconciling subscriptions between Stripe and the database
 * This route is designed to be called by a cron job
 * 
 * @param req The incoming request
 * @returns A JSON response indicating success or failure
 */
export async function GET(req: NextRequest) {
  // Verify authorization if needed
  const authHeader = req.headers.get('authorization');
  
  // If you have a secret key for your cron jobs, verify it here
  if (process.env.CRON_SECRET && (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`)) {
    console.error('Unauthorized access to cron job');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Starting subscription reconciliation cron job');
    
    // Step 1: Get all subscriptions from Stripe
    console.log('Fetching subscriptions from Stripe...');
    const stripeSubscriptions = await fetchAllStripeSubscriptions();
    console.log(`Found ${stripeSubscriptions.length} subscriptions in Stripe`);
    
    // Step 2: Get all subscriptions from the database
    console.log('Fetching subscriptions from database...');
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
    console.log(`Found ${dbSubscriptions.length} subscriptions in database`);
    
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
    
    console.log(`Found ${missingInDb.length} subscriptions in Stripe but not in database`);
    
    // Step 5: Find subscriptions that exist in the database but not in Stripe
    const missingInStripe = dbSubscriptions.filter(dbSub => {
      return dbSub.stripeSubscriptionId && !stripeSubMap.has(dbSub.stripeSubscriptionId);
    });
    
    console.log(`Found ${missingInStripe.length} subscriptions in database but not in Stripe`);
    
    // Step 6: Find subscriptions with mismatched statuses
    const statusMismatches = dbSubscriptions.filter(dbSub => {
      if (!dbSub.stripeSubscriptionId) return false;
      
      const stripeSub = stripeSubMap.get(dbSub.stripeSubscriptionId);
      if (!stripeSub) return false;
      
      return dbSub.status !== stripeSub.status;
    });
    
    console.log(`Found ${statusMismatches.length} subscriptions with mismatched statuses`);
    
    // Step 7: Apply fixes
    let fixedCount = 0;
    
    // Fix missing subscriptions in database
    for (const stripeSub of missingInDb) {
      await fixMissingInDatabase(stripeSub);
      fixedCount++;
    }
    
    // Fix status mismatches
    for (const dbSub of statusMismatches) {
      if (dbSub.stripeSubscriptionId) {
        const stripeSub = stripeSubMap.get(dbSub.stripeSubscriptionId);
        if (stripeSub) {
          await fixStatusMismatch(dbSub, stripeSub);
          fixedCount++;
        }
      }
    }
    
    // Mark orphaned database subscriptions
    for (const dbSub of missingInStripe) {
      if (dbSub.stripeSubscriptionId) {
        await markOrphanedSubscription(dbSub);
        fixedCount++;
      }
    }
    
    console.log(`Subscription reconciliation completed. Fixed ${fixedCount} issues.`);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription reconciliation completed successfully',
      stats: {
        stripeSubscriptions: stripeSubscriptions.length,
        dbSubscriptions: dbSubscriptions.length,
        missingInDb: missingInDb.length,
        missingInStripe: missingInStripe.length,
        statusMismatches: statusMismatches.length,
        fixedCount,
      },
    });
    
  } catch (error) {
    console.error('Error in subscription reconciliation cron job:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to reconcile subscriptions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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
    const params: Stripe.SubscriptionListParams = {
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
async function fixMissingInDatabase(stripeSub: Stripe.Subscription) {
  try {
    // Try to find the user ID from the subscription metadata
    let userId = stripeSub.metadata?.userId;
    
    // If not found in subscription metadata, try to find it in customer metadata
    if (!userId && stripeSub.customer) {
      const customerId = typeof stripeSub.customer === 'string' 
        ? stripeSub.customer 
        : stripeSub.customer.id;
      
      const customer = await stripe.customers.retrieve(customerId);
      
      if (!customer.deleted) {
        userId = customer.metadata?.userId;
        
        // If still not found, try to find a user with matching email
        if (!userId && customer.email) {
          const user = await prisma.user.findFirst({
            where: { email: customer.email },
          });
          
          if (user) {
            userId = user.id;
            console.log(`Found user by email: ${customer.email}`, { userId });
          }
        }
      }
    }
    
    if (!userId) {
      console.error(`Cannot create subscription record: No userId found for Stripe subscription ${stripeSub.id}`);
      return;
    }
    
    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      console.error(`Cannot create subscription record: User ${userId} not found in database`);
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
    
    console.log(`Created missing subscription record for ${stripeSub.id}`, {
      userId,
      subscriptionId: newSubscription.id,
      status: newSubscription.status,
    });
    
  } catch (error) {
    console.error(`Error fixing missing subscription ${stripeSub.id} in database:`, error);
  }
}

/**
 * Fix a subscription with mismatched status between Stripe and the database
 */
async function fixStatusMismatch(dbSub: {
  id: string;
  stripeSubscriptionId: string | null;
  userId: string;
  status: string;
}, stripeSub: Stripe.Subscription) {
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
    
    console.log(`Updated subscription status for ${dbSub.stripeSubscriptionId}`, {
      subscriptionId: dbSub.id,
      oldStatus: dbSub.status,
      newStatus: stripeSub.status,
      userId: dbSub.userId,
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error(`Error fixing status mismatch for subscription ${dbSub.id}:`, error);
  }
}

/**
 * Mark a subscription that exists in the database but not in Stripe
 */
async function markOrphanedSubscription(dbSub: {
  id: string;
  stripeSubscriptionId: string | null;
  userId: string;
}) {
  try {
    // Update the subscription status to indicate it's orphaned
    const updatedSubscription = await prisma.subscription.update({
      where: { id: dbSub.id },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
      },
    });
    
    console.log(`Marked orphaned subscription ${dbSub.id}`, {
      stripeId: dbSub.stripeSubscriptionId,
      userId: dbSub.userId,
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error(`Error marking orphaned subscription ${dbSub.id}:`, error);
  }
}
