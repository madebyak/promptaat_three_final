// Script to update subscription price IDs to match Stripe price IDs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Current SubscriptionPrice records:');
  const currentPrices = await prisma.subscriptionPrice.findMany({
    include: {
      plan: true,
    },
  });

  console.log(`Found ${currentPrices.length} subscription prices:`);
  currentPrices.forEach(price => {
    console.log(`ID: ${price.id}`);
    console.log(`Plan ID: ${price.planId}`);
    console.log(`Amount: ${price.amount / 100} ${price.currency}`);
    console.log(`Interval: ${price.interval}`);
    console.log('-'.repeat(30));
  });

  // Get environment variables for price IDs
  const monthlyPriceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
  const quarterlyPriceId = process.env.STRIPE_PRICE_ID_PRO_QUARTERLY;
  const annualPriceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL;

  if (!monthlyPriceId || !quarterlyPriceId || !annualPriceId) {
    console.error('Missing one or more price IDs in environment variables');
    return;
  }

  // Find prices by interval
  const monthlyPrice = currentPrices.find(p => p.interval === 'monthly');
  const quarterlyPrice = currentPrices.find(p => p.interval === 'quarterly');
  const annualPrice = currentPrices.find(p => p.interval === 'annual');

  console.log('\nUpdating subscription price IDs to match Stripe price IDs...');

  // Update monthly price
  if (monthlyPrice) {
    console.log(`Updating monthly price (${monthlyPrice.id}) to ${monthlyPriceId}`);
    
    try {
      // Create new record with Stripe price ID
      await prisma.subscriptionPrice.create({
        data: {
          id: monthlyPriceId,
          planId: monthlyPrice.planId,
          amount: monthlyPrice.amount,
          currency: monthlyPrice.currency,
          interval: monthlyPrice.interval,
          intervalCount: monthlyPrice.intervalCount,
          createdAt: monthlyPrice.createdAt,
          updatedAt: new Date(),
        },
      });
      
      // Delete old record
      await prisma.subscriptionPrice.delete({
        where: {
          id: monthlyPrice.id,
        },
      });
      
      console.log('Monthly price updated successfully');
    } catch (error) {
      console.error('Error updating monthly price:', error);
    }
  } else {
    console.log('No monthly price found');
  }

  // Update quarterly price
  if (quarterlyPrice) {
    console.log(`Updating quarterly price (${quarterlyPrice.id}) to ${quarterlyPriceId}`);
    
    try {
      // Create new record with Stripe price ID
      await prisma.subscriptionPrice.create({
        data: {
          id: quarterlyPriceId,
          planId: quarterlyPrice.planId,
          amount: quarterlyPrice.amount,
          currency: quarterlyPrice.currency,
          interval: quarterlyPrice.interval,
          intervalCount: quarterlyPrice.intervalCount,
          createdAt: quarterlyPrice.createdAt,
          updatedAt: new Date(),
        },
      });
      
      // Delete old record
      await prisma.subscriptionPrice.delete({
        where: {
          id: quarterlyPrice.id,
        },
      });
      
      console.log('Quarterly price updated successfully');
    } catch (error) {
      console.error('Error updating quarterly price:', error);
    }
  } else {
    console.log('No quarterly price found');
  }

  // Update annual price
  if (annualPrice) {
    console.log(`Updating annual price (${annualPrice.id}) to ${annualPriceId}`);
    
    try {
      // Create new record with Stripe price ID
      await prisma.subscriptionPrice.create({
        data: {
          id: annualPriceId,
          planId: annualPrice.planId,
          amount: annualPrice.amount,
          currency: annualPrice.currency,
          interval: annualPrice.interval,
          intervalCount: annualPrice.intervalCount,
          createdAt: annualPrice.createdAt,
          updatedAt: new Date(),
        },
      });
      
      // Delete old record
      await prisma.subscriptionPrice.delete({
        where: {
          id: annualPrice.id,
        },
      });
      
      console.log('Annual price updated successfully');
    } catch (error) {
      console.error('Error updating annual price:', error);
    }
  } else {
    console.log('No annual price found');
  }

  // Verify the updates
  console.log('\nVerifying updated subscription price IDs:');
  const updatedPrices = await prisma.subscriptionPrice.findMany();
  
  updatedPrices.forEach(price => {
    console.log(`ID: ${price.id}`);
    console.log(`Interval: ${price.interval}`);
    console.log('-'.repeat(30));
  });
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
