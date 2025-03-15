// Script to test the subscription system
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
    console.log('🔍 Testing the subscription system...');
    
    // 1. Check for recent events related to subscriptions
    const events = await stripe.events.list({ 
      limit: 10,
      types: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'checkout.session.completed'
      ]
    });
    
    console.log(`\n📋 Found ${events.data.length} recent subscription-related events:`);
    for (const event of events.data) {
      console.log(`  - ${event.type} (${event.id}) at ${new Date(event.created * 1000).toLocaleString()}`);
      
      // For checkout.session.completed events, let's check the metadata
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`    • Session ID: ${session.id}`);
        console.log(`    • Customer: ${session.customer}`);
        console.log(`    • Client Reference ID: ${session.client_reference_id || 'None'}`);
        console.log(`    • Metadata:`, session.metadata);
      }
      
      // For subscription events, get the subscription details
      if (event.type.startsWith('customer.subscription.')) {
        const subscription = event.data.object;
        console.log(`    • Subscription ID: ${subscription.id}`);
        console.log(`    • Customer: ${subscription.customer}`);
        console.log(`    • Status: ${subscription.status}`);
        console.log(`    • Metadata:`, subscription.metadata);
      }
    }
    
    // 2. Check for subscriptions in the database
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log(`\n📋 Found ${subscriptions.length} subscriptions in the database:`);
    for (const sub of subscriptions) {
      console.log(`\n  Subscription: ${sub.id}`);
      console.log(`  - Created: ${sub.createdAt.toLocaleString()}`);
      console.log(`  - User: ${sub.user?.email} (${sub.userId})`);
      console.log(`  - Status: ${sub.status}`);
      console.log(`  - Plan: ${sub.plan || 'Not set'}`);
      console.log(`  - Interval: ${sub.interval || 'Not set'}`);
      console.log(`  - Stripe Subscription ID: ${sub.stripeSubscriptionId || 'Not set'}`);
      console.log(`  - Stripe Customer ID: ${sub.stripeCustomerId || 'Not set'}`);
      console.log(`  - Stripe Price ID: ${sub.stripePriceId || 'Not set'}`);
      console.log(`  - Current Period: ${sub.currentPeriodStart?.toLocaleString() || 'Not set'} to ${sub.currentPeriodEnd?.toLocaleString() || 'Not set'}`);
    }
    
    // 3. Provide troubleshooting guidance based on findings
    console.log('\n📝 DIAGNOSIS AND NEXT STEPS:');
    
    if (events.data.length > 0 && subscriptions.length === 0) {
      console.log('❗ Stripe events exist but no subscriptions are in the database.');
      console.log('   This suggests the webhook events are not being processed correctly.');
      console.log('   1. Make sure your server is running and can receive webhook events.');
      console.log('   2. Check that the Stripe CLI is forwarding events to http://localhost:3000/api/webhooks/stripe');
      console.log('   3. Try making a test subscription and monitor the server logs.');
    } else if (events.data.length > 0 && subscriptions.length > 0) {
      console.log('✅ Good news! You have both Stripe events and subscriptions in the database.');
      console.log('   This suggests your webhook handling is working properly.');
      console.log('   If you\'re still experiencing issues, check:');
      console.log('   1. Are the subscriptions associated with the correct user IDs?');
      console.log('   2. Does the subscription status match what you expect?');
    } else if (events.data.length === 0) {
      console.log('❓ No recent subscription events found in Stripe.');
      console.log('   Try creating a test subscription to generate events.');
    }
    
    console.log('\n✨ SOLUTION:');
    console.log('1. We\'ve identified that Stripe webhook events are configured to send to:');
    console.log('   https://www.promptaat.com/api/stripe/webhook');
    console.log('');
    console.log('2. But your application code expects them at:');
    console.log('   /api/webhooks/stripe');
    console.log('');
    console.log('3. We\'ve implemented two fixes:');
    console.log('   a. Added a forwarding endpoint at /api/stripe/webhook');
    console.log('   b. Started the Stripe CLI to forward events to your local environment');
    console.log('');
    console.log('4. To permanently fix this, you should update your Stripe webhook URL in the dashboard');
    console.log('   to match your application: /api/webhooks/stripe');
    
  } catch (error) {
    console.error('Error testing subscription system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
