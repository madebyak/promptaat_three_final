const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: 'job@mindmuse.co' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptions: {
          include: {
            price: true
          }
        }
      }
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User:', {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });

    console.log('\nSubscriptions:');
    if (user.subscriptions.length === 0) {
      console.log('No subscriptions found');
    } else {
      user.subscriptions.forEach((sub, index) => {
        console.log(`\nSubscription #${index + 1}:`);
        console.log(JSON.stringify(sub, null, 2));
      });
    }

    // Check Stripe subscriptions
    console.log('\nChecking Stripe subscriptions...');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Find customer ID
    let stripeCustomerId = null;
    if (user.subscriptions.length > 0 && user.subscriptions[0].stripeCustomerId) {
      stripeCustomerId = user.subscriptions[0].stripeCustomerId;
    }

    if (stripeCustomerId) {
      console.log(`Found Stripe customer ID: ${stripeCustomerId}`);
      
      // Get customer's subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        limit: 10,
      });
      
      console.log('\nStripe Subscriptions:');
      if (subscriptions.data.length === 0) {
        console.log('No Stripe subscriptions found');
      } else {
        subscriptions.data.forEach((sub, index) => {
          console.log(`\nStripe Subscription #${index + 1}:`);
          console.log({
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            metadata: sub.metadata
          });
        });
      }
    } else {
      console.log('No Stripe customer ID found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
