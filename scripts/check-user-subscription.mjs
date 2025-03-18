import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find user by email
    const userEmail = 'ranya.hamawandy@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        subscriptions: true
      }
    });

    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      return;
    }

    console.log('User details:');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Created At: ${user.createdAt}`);
    
    console.log('\nSubscription details:');
    if (user.subscriptions.length === 0) {
      console.log('No subscriptions found for this user');
    } else {
      user.subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription #${index + 1}:`);
        console.log(`ID: ${sub.id}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Created At: ${sub.createdAt}`);
        console.log(`Current Period Start: ${sub.currentPeriodStart}`);
        console.log(`Current Period End: ${sub.currentPeriodEnd}`);
        console.log(`Stripe Subscription ID: ${sub.stripeSubscriptionId || 'N/A'}`);
        console.log(`Stripe Customer ID: ${sub.stripeCustomerId || 'N/A'}`);
        console.log(`Stripe Price ID: ${sub.stripePriceId || 'N/A'}`);
        console.log(`Plan: ${sub.plan || 'N/A'}`);
        console.log(`Interval: ${sub.interval || 'N/A'}`);
        console.log(`Cancel At Period End: ${sub.cancelAtPeriodEnd}`);
      });
    }

    // Check if user would be considered subscribed by the isUserSubscribed function
    const activeSubscription = user.subscriptions.find(sub => {
      const isStatusValid = 
        sub.status === 'active' || 
        sub.status === 'Active' || 
        sub.status === 'incomplete' ||
        sub.status.toLowerCase() === 'active';
      
      const isPeriodValid = new Date(sub.currentPeriodEnd) > new Date();
      
      return isStatusValid && isPeriodValid;
    });

    console.log('\nSubscription status check:');
    console.log(`Would be considered subscribed: ${!!activeSubscription}`);
    if (activeSubscription) {
      console.log(`Based on status: ${activeSubscription.status}`);
      console.log(`Period end is in future: ${new Date(activeSubscription.currentPeriodEnd) > new Date()}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
