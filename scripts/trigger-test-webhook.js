// Script to trigger a test webhook event for subscription creation
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
    console.log('🔍 Creating a test subscription event...');
    
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
    
    // Create a test customer if it doesn't exist
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log(`📝 Using existing Stripe customer: ${customer.id}`);
        
        // Update customer metadata to include userId
        await stripe.customers.update(customer.id, {
          metadata: { userId: user.id }
        });
        console.log(`📝 Updated customer metadata with userId: ${user.id}`);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.email,
          metadata: { userId: user.id }
        });
        console.log(`📝 Created new Stripe customer: ${customer.id}`);
      }
    } catch (error) {
      console.error('❌ Error creating/retrieving customer:', error);
      return;
    }
    
    // Get the subscription price ID
    const priceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
    if (!priceId) {
      console.error('❌ Missing STRIPE_PRICE_ID_PRO_MONTHLY environment variable');
      return;
    }
    
    console.log(`📝 Using price ID: ${priceId}`);
    
    // Create a test subscription with the right metadata
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        metadata: {
          userId: user.id,
          plan: 'pro',
          interval: 'monthly'
        },
        expand: ['latest_invoice.payment_intent']
      });
      
      console.log(`✅ Created test subscription: ${subscription.id}`);
      console.log(`📝 Status: ${subscription.status}`);
      console.log(`📝 Metadata: `, subscription.metadata);
      
      // Trigger a webhook event for testing
      const event = await stripe.testHelpers.events.create({
        type: 'customer.subscription.created',
        data: { 
          object: subscription
        }
      });
      
      console.log(`✅ Created test event: ${event.id} (${event.type})`);
      console.log(`📝 This event will be forwarded to your webhook handler by the Stripe CLI`);
      console.log(`📝 Check your server logs for webhook processing`);
      
    } catch (error) {
      console.error('❌ Error creating test subscription:', error);
    }
    
  } catch (error) {
    console.error('Error creating test event:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
