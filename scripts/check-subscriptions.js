// Script to check subscriptions in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Count subscriptions
    const count = await prisma.subscription.count();
    console.log(`Total subscriptions: ${count}`);
    
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany();
    console.log('Subscriptions:', JSON.stringify(subscriptions, null, 2));
    
    // Check subscription_prices table
    const prices = await prisma.subscriptionPrice.findMany();
    console.log(`Total subscription prices: ${prices.length}`);
    console.log('Subscription prices:', JSON.stringify(prices, null, 2));
    
    // Check subscription_plans table
    const plans = await prisma.subscriptionPlan.findMany();
    console.log(`Total subscription plans: ${plans.length}`);
    console.log('Subscription plans:', JSON.stringify(plans, null, 2));
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
