// This script cleans up all test data in your Stripe account
// It removes subscriptions, customers, products, prices, and checkout sessions
// Usage: NODE_ENV=development node -r dotenv/config scripts/clear-stripe-test-data.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Stripe = require('stripe');

// Make sure we have the Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
  console.error('Please run this script with environment variables loaded:');
  console.error('NODE_ENV=development node -r dotenv/config scripts/clear-stripe-test-data.js');
  process.exit(1);
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function main() {
  console.log('Starting Stripe test data cleanup...');
  console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Set (hidden for security)' : 'Not set');
  
  try {
    // 1. Cancel all active subscriptions
    console.log('\n--- Cleaning up subscriptions ---');
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all'
    });
    
    console.log(`Found ${subscriptions.data.length} subscriptions in Stripe`);
    
    for (const subscription of subscriptions.data) {
      if (subscription.status !== 'canceled') {
        try {
          console.log(`Canceling subscription: ${subscription.id} (${subscription.status})`);
          await stripe.subscriptions.cancel(subscription.id, {
            invoice_now: false,
            prorate: false
          });
          console.log(`Successfully canceled subscription: ${subscription.id}`);
        } catch (error) {
          console.error(`Error canceling subscription ${subscription.id}:`, error.message);
        }
      } else {
        console.log(`Subscription already canceled: ${subscription.id}`);
      }
    }
    
    // 2. Delete all customers
    console.log('\n--- Cleaning up customers ---');
    const customers = await stripe.customers.list({
      limit: 100
    });
    
    console.log(`Found ${customers.data.length} customers in Stripe`);
    
    for (const customer of customers.data) {
      try {
        console.log(`Deleting customer: ${customer.id} (${customer.email || 'No email'})`);
        await stripe.customers.del(customer.id);
        console.log(`Successfully deleted customer: ${customer.id}`);
      } catch (error) {
        console.error(`Error deleting customer ${customer.id}:`, error.message);
      }
    }
    
    // 3. Archive all products (can't delete products with prices)
    console.log('\n--- Archiving products ---');
    const products = await stripe.products.list({
      limit: 100,
      active: true
    });
    
    console.log(`Found ${products.data.length} active products in Stripe`);
    
    for (const product of products.data) {
      try {
        console.log(`Archiving product: ${product.id} (${product.name})`);
        await stripe.products.update(product.id, {
          active: false
        });
        console.log(`Successfully archived product: ${product.id}`);
      } catch (error) {
        console.error(`Error archiving product ${product.id}:`, error.message);
      }
    }
    
    // 4. Archive all prices (can't delete prices)
    console.log('\n--- Archiving prices ---');
    const prices = await stripe.prices.list({
      limit: 100,
      active: true
    });
    
    console.log(`Found ${prices.data.length} active prices in Stripe`);
    
    for (const price of prices.data) {
      try {
        console.log(`Archiving price: ${price.id} (${price.nickname || 'No nickname'})`);
        await stripe.prices.update(price.id, {
          active: false
        });
        console.log(`Successfully archived price: ${price.id}`);
      } catch (error) {
        console.error(`Error archiving price ${price.id}:`, error.message);
      }
    }
    
    // 5. Clean up database subscriptions if any remain
    console.log('\n--- Cleaning up database subscriptions ---');
    const dbSubscriptions = await prisma.subscription.findMany();
    console.log(`Found ${dbSubscriptions.length} subscriptions in database`);
    
    if (dbSubscriptions.length > 0) {
      console.log('Deleting all database subscriptions...');
      await prisma.subscription.deleteMany({});
      console.log('Successfully deleted all database subscriptions');
    }
    
    console.log('\nStripe test data cleanup complete!');
    
  } catch (error) {
    console.error('Error during Stripe test data cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
