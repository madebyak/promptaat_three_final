// Simple script to check subscription prices in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking environment variables:');
  console.log('STRIPE_PRICE_ID_PRO_MONTHLY:', process.env.STRIPE_PRICE_ID_PRO_MONTHLY);
  console.log('STRIPE_PRICE_ID_PRO_QUARTERLY:', process.env.STRIPE_PRICE_ID_PRO_QUARTERLY);
  console.log('STRIPE_PRICE_ID_PRO_ANNUAL:', process.env.STRIPE_PRICE_ID_PRO_ANNUAL);
  console.log('-'.repeat(50));

  console.log('Fetching SubscriptionPrice records:');
  const prices = await prisma.subscriptionPrice.findMany({
    include: {
      plan: true,
    },
  });

  console.log(`Found ${prices.length} subscription prices:`);
  prices.forEach(price => {
    console.log(`ID: ${price.id}`);
    console.log(`Plan ID: ${price.planId}`);
    console.log(`Plan Name: ${price.plan?.name || 'N/A'}`);
    console.log(`Amount: ${price.amount / 100} ${price.currency}`);
    console.log(`Interval: ${price.interval}`);
    console.log(`Interval Count: ${price.intervalCount}`);
    console.log(`Created At: ${price.createdAt}`);
    console.log('-'.repeat(30));
  });

  console.log('Checking if any of the Stripe price IDs match database records:');
  if (process.env.STRIPE_PRICE_ID_PRO_MONTHLY) {
    const monthlyMatch = prices.some(p => p.id === process.env.STRIPE_PRICE_ID_PRO_MONTHLY);
    console.log(`Monthly price ID match: ${monthlyMatch}`);
  }
  
  if (process.env.STRIPE_PRICE_ID_PRO_QUARTERLY) {
    const quarterlyMatch = prices.some(p => p.id === process.env.STRIPE_PRICE_ID_PRO_QUARTERLY);
    console.log(`Quarterly price ID match: ${quarterlyMatch}`);
  }
  
  if (process.env.STRIPE_PRICE_ID_PRO_ANNUAL) {
    const annualMatch = prices.some(p => p.id === process.env.STRIPE_PRICE_ID_PRO_ANNUAL);
    console.log(`Annual price ID match: ${annualMatch}`);
  }
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
