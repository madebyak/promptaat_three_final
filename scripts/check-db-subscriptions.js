// Script to check for subscriptions in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking for subscriptions in the database...');
    
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    if (subscriptions.length > 0) {
      subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription ${index + 1}:`);
        console.log(`ID: ${sub.id}`);
        console.log(`User ID: ${sub.userId}`);
        console.log(`User Email: ${sub.user?.email || 'Unknown'}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Plan: ${sub.plan || 'Not set'}`);
        console.log(`Interval: ${sub.interval || 'Not set'}`);
        console.log(`Stripe Subscription ID: ${sub.stripeSubscriptionId || 'Not set'}`);
        console.log(`Created At: ${sub.createdAt}`);
      });
    } else {
      console.log('No subscriptions found in the database.');
    }
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
