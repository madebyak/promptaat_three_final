// Script to diagnose subscription issues by comparing database and Stripe data
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const prisma = new PrismaClient();

// Initialize Stripe with API key from env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia"
});

async function main() {
  try {
    console.log('🔍 Diagnosing subscription issues...');
    
    // 1. Get subscriptions from the database
    const dbSubscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${dbSubscriptions.length} subscriptions in the database`);
    
    // 2. Check each subscription against Stripe
    for (const dbSub of dbSubscriptions) {
      console.log('\n===============================================');
      console.log(`Checking subscription for ${dbSub.user?.email || 'Unknown'}`);
      console.log('===============================================');
      
      console.log('\n=== DATABASE SUBSCRIPTION ===');
      console.log(`ID: ${dbSub.id}`);
      console.log(`User ID: ${dbSub.userId}`);
      console.log(`Status: ${dbSub.status}`);
      console.log(`Plan: ${dbSub.plan}`);
      console.log(`Interval: ${dbSub.interval}`);
      console.log(`Stripe Subscription ID: ${dbSub.stripeSubscriptionId}`);
      console.log(`Created At: ${dbSub.createdAt}`);
      
      if (!dbSub.stripeSubscriptionId) {
        console.log('❌ ERROR: Missing Stripe subscription ID in database record');
        continue;
      }
      
      // 3. Fetch the corresponding subscription from Stripe
      try {
        const stripeSub = await stripe.subscriptions.retrieve(dbSub.stripeSubscriptionId);
        
        console.log('\n=== STRIPE SUBSCRIPTION ===');
        console.log(`ID: ${stripeSub.id}`);
        console.log(`Status: ${stripeSub.status}`);
        console.log(`Customer: ${stripeSub.customer}`);
        console.log(`Current Period Start: ${new Date(stripeSub.current_period_start * 1000).toISOString()}`);
        console.log(`Current Period End: ${new Date(stripeSub.current_period_end * 1000).toISOString()}`);
        console.log(`Cancel At Period End: ${stripeSub.cancel_at_period_end}`);
        console.log(`Metadata:`, stripeSub.metadata);
        
        // 4. Check for customer details
        const customer = await stripe.customers.retrieve(stripeSub.customer);
        console.log('\n=== STRIPE CUSTOMER ===');
        console.log(`ID: ${customer.id}`);
        console.log(`Email: ${customer.email}`);
        console.log(`Metadata:`, customer.metadata);
        
        // 5. Compare important fields
        console.log('\n=== COMPARISON ===');
        
        // Check status
        if (dbSub.status !== stripeSub.status) {
          console.log(`❌ STATUS MISMATCH: Database has "${dbSub.status}" but Stripe has "${stripeSub.status}"`);
        } else {
          console.log(`✅ Status matches: ${dbSub.status}`);
        }
        
        // Check Stripe Customer ID
        if (dbSub.stripeCustomerId !== stripeSub.customer) {
          console.log(`❌ CUSTOMER ID MISMATCH: Database has "${dbSub.stripeCustomerId}" but Stripe has "${stripeSub.customer}"`);
        } else {
          console.log(`✅ Stripe Customer ID matches: ${dbSub.stripeCustomerId}`);
        }
        
        // Check metadata userId
        const stripeUserId = stripeSub.metadata?.userId || customer.metadata?.userId;
        if (!stripeUserId) {
          console.log(`❌ MISSING USER ID: No userId in Stripe metadata (subscription or customer)`);
        } else if (dbSub.userId !== stripeUserId) {
          console.log(`❌ USER ID MISMATCH: Database has "${dbSub.userId}" but Stripe has "${stripeUserId}"`);
        } else {
          console.log(`✅ User ID matches: ${dbSub.userId}`);
        }
        
        // 6. Check recent events for this subscription
        console.log('\n=== RECENT STRIPE EVENTS ===');
        const events = await stripe.events.list({
          limit: 5,
          type: 'customer.subscription.updated',
          created: {
            gte: Math.floor(Date.now() / 1000) - 86400 // Last 24 hours
          }
        });
        
        if (events.data.length === 0) {
          console.log('No recent subscription update events found');
        } else {
          events.data.forEach((event, i) => {
            const eventSub = event.data.object;
            if (eventSub.id === dbSub.stripeSubscriptionId) {
              console.log(`Event ${i+1}: ${event.type} at ${new Date(event.created * 1000).toISOString()}`);
              console.log(`  - Previous status: ${event.data.previous_attributes?.status || 'unknown'}`);
              console.log(`  - New status: ${eventSub.status}`);
            }
          });
        }
        
        // 7. Check related invoices
        console.log('\n=== RELATED INVOICES ===');
        const invoices = await stripe.invoices.list({
          subscription: dbSub.stripeSubscriptionId,
          limit: 5
        });
        
        if (invoices.data.length === 0) {
          console.log('No invoices found for this subscription');
        } else {
          invoices.data.forEach((invoice, i) => {
            console.log(`Invoice ${i+1}: ${invoice.id}`);
            console.log(`  - Status: ${invoice.status}`);
            console.log(`  - Paid: ${invoice.paid}`);
            console.log(`  - Amount due: ${invoice.amount_due / 100} ${invoice.currency}`);
            console.log(`  - Created: ${new Date(invoice.created * 1000).toISOString()}`);
          });
        }
        
      } catch (error) {
        console.error(`❌ Error retrieving Stripe subscription: ${error.message}`);
      }
    }
    
    console.log('\n===============================================');
    console.log('DIAGNOSIS SUMMARY');
    console.log('===============================================');
    
    if (dbSubscriptions.length === 0) {
      console.log('No subscriptions found in the database to analyze.');
    } else if (dbSubscriptions.some(sub => sub.status !== 'active')) {
      console.log('Issue detected: One or more subscriptions are not in active status in the database.');
      console.log('Possible causes:');
      console.log('1. Webhook event for status update not received or processed');
      console.log('2. User ID in Stripe metadata doesn\'t match database records');
      console.log('3. Payment processing issue in Stripe (check invoices)');
      console.log('\nPossible solutions:');
      console.log('1. Verify webhook endpoint configuration in Stripe dashboard');
      console.log('2. Check Stripe CLI for webhook forwarding status');
      console.log('3. Manually update subscription status in database for testing');
    } else {
      console.log('All database subscriptions appear to be in sync with Stripe.');
    }
    
  } catch (error) {
    console.error('Error in diagnostic script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
