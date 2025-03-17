const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function main() {
  try {
    // Get the user we're investigating
    const user = await prisma.user.findUnique({
      where: { email: 'job@mindmuse.co' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptions: true
      }
    });

    console.log('User:', {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });

    // Get recent Stripe events
    console.log('\nChecking recent Stripe events...');
    const events = await stripe.events.list({
      limit: 10,
      type: 'customer.subscription'
    });

    console.log(`Found ${events.data.length} recent subscription events`);
    
    for (const event of events.data) {
      console.log(`\nEvent: ${event.id} (${event.type})`);
      console.log(`Created: ${new Date(event.created * 1000).toISOString()}`);
      
      const subscription = event.data.object;
      
      // Check if this event is related to our user
      let isUserEvent = false;
      
      // Check metadata
      if (subscription.metadata && subscription.metadata.userId === user.id) {
        isUserEvent = true;
        console.log(`Event is for our user (from metadata)`);
      }
      
      // Check if the subscription ID matches any of the user's subscriptions
      if (user.subscriptions.some(sub => sub.stripeSubscriptionId === subscription.id)) {
        isUserEvent = true;
        console.log(`Event is for our user (from subscription ID match)`);
      }
      
      if (isUserEvent) {
        console.log(`Subscription ID: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        console.log(`Customer: ${subscription.customer}`);
        console.log(`Metadata:`, subscription.metadata);
      }
    }
    
    // Check for checkout.session.completed events
    console.log('\nChecking recent checkout session events...');
    const checkoutEvents = await stripe.events.list({
      limit: 10,
      type: 'checkout.session.completed'
    });
    
    console.log(`Found ${checkoutEvents.data.length} recent checkout session events`);
    
    for (const event of checkoutEvents.data) {
      console.log(`\nEvent: ${event.id} (${event.type})`);
      console.log(`Created: ${new Date(event.created * 1000).toISOString()}`);
      
      const session = event.data.object;
      
      // Check if this event is related to our user
      let isUserEvent = false;
      
      // Check client_reference_id
      if (session.client_reference_id === user.id) {
        isUserEvent = true;
        console.log(`Event is for our user (from client_reference_id)`);
      }
      
      // Check metadata
      if (session.metadata && session.metadata.userId === user.id) {
        isUserEvent = true;
        console.log(`Event is for our user (from metadata)`);
      }
      
      if (isUserEvent) {
        console.log(`Session ID: ${session.id}`);
        console.log(`Customer: ${session.customer}`);
        console.log(`Subscription: ${session.subscription}`);
        console.log(`Mode: ${session.mode}`);
        console.log(`Payment Status: ${session.payment_status}`);
        console.log(`Metadata:`, session.metadata);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
