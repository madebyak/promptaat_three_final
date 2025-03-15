/**
 * This utility script sets a user as subscribed for development testing purposes.
 * It creates a subscription record for the specified user with active status.
 * 
 * Usage: 
 * npx ts-node scripts/set-user-subscribed.ts <email>
 */

import { PrismaClient } from '@prisma/client';
import { addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function setUserAsSubscribed(email: string) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscriptions: true },
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);

    // Find the Pro subscription plan
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Pro' },
      include: { prices: true },
    });

    if (!plan) {
      console.error('Pro subscription plan not found. Please ensure it exists in the database.');
      return;
    }

    // Get the monthly price
    const price = plan.prices.find(p => p.interval === 'month');
    if (!price) {
      console.error('Monthly price for Pro plan not found.');
      return;
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = addMonths(now, 1); // 1 month subscription

    // Check if user already has a subscription
    if (user.subscriptions && user.subscriptions.length > 0) {
      // Update existing subscription
      const subscription = user.subscriptions[0];
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          priceId: price.id,
        },
      });
      console.log(`Updated existing subscription for user ${user.email}`);
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          priceId: price.id,
        },
      });
      console.log(`Created new subscription for user ${user.email}`);
    }

    // Update user record with Stripe-like fields
    // Note: These fields are not in the User model, so we'll skip this part
    // and rely on the subscription record instead
    
    console.log(`Successfully set user ${user.email} as subscribed until ${periodEnd.toISOString()}`);
    console.log('You can now test Pro features with this account.');
  } catch (error) {
    console.error('Error setting user as subscribed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide a user email. Usage: npx ts-node scripts/set-user-subscribed.ts <email>');
  process.exit(1);
}

setUserAsSubscribed(email);
