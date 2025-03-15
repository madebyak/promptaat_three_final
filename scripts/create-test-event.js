// Script to create a custom test webhook event with proper metadata
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
    console.log('🔍 Creating a custom test webhook event...');
    
    // First, get a user to associate with the subscription
    const user = await prisma.user.findFirst({
      where: { role: "USER" },
      orderBy: { createdAt: 'desc' },
    });
    
    if (!user) {
      console.error('❌ No user found in the database');
      return;
    }
    
    console.log(`📝 Found user: ${user.email} (${user.id})`);
    
    // Create a test subscription event with the user ID in metadata
    const subscriptionObject = {
      id: 'sub_test_' + Math.random().toString(36).substring(2, 15),
      customer: 'cus_test_' + Math.random().toString(36).substring(2, 15),
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000) - 3600,
      current_period_end: Math.floor(Date.now() / 1000) + 2592000, // +30 days
      cancel_at_period_end: false,
      metadata: {
        userId: user.id,
        plan: 'pro',
        interval: 'monthly'
      },
      items: {
        data: [
          {
            price: {
              id: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_test',
              recurring: {
                interval: 'month',
                interval_count: 1
              },
              unit_amount: 1999,
              currency: 'usd'
            }
          }
        ]
      }
    };
    
    console.log('📝 Created test subscription object with metadata:', subscriptionObject.metadata);
    
    // Create a test event using the Stripe API
    try {
      const event = await stripe.testHelpers.events.create({
        type: 'customer.subscription.created',
        data: {
          object: subscriptionObject
        }
      });
      
      console.log(`✅ Created test event: ${event.id}`);
      console.log('📝 This event will be forwarded to your webhook handler by the Stripe CLI');
      console.log('📝 Check your server logs for webhook processing');
      
      // Manually trigger the webhook endpoint to ensure it's processed
      console.log('📝 Manually triggering webhook processing...');
      
      // Print the command to manually trigger the webhook
      console.log('\n📋 To manually test the webhook, run this command:');
      console.log(`stripe trigger customer.subscription.created --override "data.object.metadata.userId=${user.id}" --override "data.object.metadata.plan=pro" --override "data.object.metadata.interval=monthly"\n`);
      
    } catch (error) {
      console.error('❌ Error creating test event:', error);
    }
    
  } catch (error) {
    console.error('Error in script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
