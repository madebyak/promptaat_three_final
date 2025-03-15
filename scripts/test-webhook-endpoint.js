// Script to test the webhook endpoint configuration
const { PrismaClient } = require('@prisma/client');
const { stripe } = require('../src/lib/stripe');
const prisma = new PrismaClient();

async function main() {
  try {
    // List all webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list();
    
    console.log('Current Stripe webhook endpoints:');
    webhooks.data.forEach(webhook => {
      console.log(`\nEndpoint ID: ${webhook.id}`);
      console.log(`URL: ${webhook.url}`);
      console.log(`Status: ${webhook.status}`);
      console.log(`Events: ${webhook.enabled_events.join(', ')}`);
      console.log(`Created: ${new Date(webhook.created * 1000).toLocaleString()}`);
    });
    
    if (webhooks.data.length === 0) {
      console.log('\nNo webhook endpoints configured in Stripe!');
      console.log('This is likely why subscription events are not being recorded.');
      console.log('You need to set up the Stripe CLI for local development:');
      console.log('1. Install Stripe CLI: https://stripe.com/docs/stripe-cli');
      console.log('2. Run: stripe listen --forward-to http://localhost:3000/api/webhooks/stripe');
    }
    
    // Check current subscriptions
    const subscriptions = await prisma.subscription.findMany();
    console.log(`\nCurrent subscriptions in database: ${subscriptions.length}`);
    
    // Check recent Stripe events
    const events = await stripe.events.list({ limit: 5 });
    console.log('\nRecent Stripe events:');
    events.data.forEach(event => {
      console.log(`- ${event.type} (${event.id}) at ${new Date(event.created * 1000).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error testing webhook endpoint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
