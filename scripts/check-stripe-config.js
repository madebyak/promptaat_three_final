// Script to check Stripe configuration
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
    console.log('🔍 Checking Stripe configuration...');
    
    // Check Stripe API key
    console.log(`\n📝 Stripe API Key status: ${process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`📝 Stripe Webhook Secret status: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
    
    // List all webhook endpoints
    console.log('\n📝 Checking webhook endpoints...');
    try {
      const webhooks = await stripe.webhookEndpoints.list();
      
      if (webhooks.data.length > 0) {
        console.log('✅ Found webhook endpoints:');
        webhooks.data.forEach(webhook => {
          console.log(`\n  - Endpoint ID: ${webhook.id}`);
          console.log(`    URL: ${webhook.url}`);
          console.log(`    Status: ${webhook.status}`);
          console.log(`    Events: ${webhook.enabled_events.join(', ')}`);
        });
      } else {
        console.log('❌ No webhook endpoints configured in Stripe!');
        console.log('   This is why subscription events are not being processed.');
        console.log('   Solution: Set up Stripe CLI for local development:');
        console.log('   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
        console.log('   2. Run: stripe login');
        console.log('   3. Run: stripe listen --forward-to http://localhost:3000/api/webhooks/stripe');
      }
    } catch (error) {
      console.error('❌ Error listing webhook endpoints:', error.message);
    }
    
    // Check recent Stripe events
    console.log('\n📝 Checking recent Stripe events...');
    try {
      const events = await stripe.events.list({ limit: 5 });
      if (events.data.length > 0) {
        console.log('✅ Recent Stripe events:');
        events.data.forEach(event => {
          console.log(`  - ${event.type} (${event.id}) at ${new Date(event.created * 1000).toLocaleString()}`);
        });
      } else {
        console.log('❓ No recent Stripe events found');
      }
    } catch (error) {
      console.error('❌ Error listing Stripe events:', error.message);
    }
    
    // Check subscriptions in the database
    console.log('\n📝 Checking database subscriptions...');
    const subscriptions = await prisma.subscription.findMany();
    if (subscriptions.length > 0) {
      console.log(`✅ Found ${subscriptions.length} subscription(s) in database`);
    } else {
      console.log('❌ No subscriptions found in database');
    }
    
    console.log('\n📝 DIAGNOSIS:');
    if (webhooks.data.length === 0) {
      console.log('❗ The primary issue is that Stripe webhooks are not reaching your application.');
      console.log('   When you complete checkout, Stripe tries to send events to your application,');
      console.log('   but there\'s no way for these events to reach your local development environment.');
      console.log('   You must run the Stripe CLI to forward events to your local server.');
    } else {
      console.log('❗ Webhooks are configured, but the events might not be reaching your application.');
      console.log('   Check the webhook endpoint URLs to ensure they match your application URL.');
    }
    
  } catch (error) {
    console.error('Error testing configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
