import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Subscription Repair Script');
    console.log('=========================\n');
    
    // Find all incomplete subscriptions with invalid end dates
    const problematicSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'incomplete',
        currentPeriodEnd: {
          lte: new Date() // End date is in the past or equal to current date
        }
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`Found ${problematicSubscriptions.length} problematic subscriptions\n`);
    
    // Fix each problematic subscription
    for (const subscription of problematicSubscriptions) {
      console.log(`Fixing subscription for ${subscription.user?.firstName} ${subscription.user?.lastName} (${subscription.user?.email})`);
      console.log(`Subscription ID: ${subscription.id}`);
      console.log(`Current status: ${subscription.status}`);
      console.log(`Current period: ${subscription.currentPeriodStart} to ${subscription.currentPeriodEnd}`);
      
      // Calculate new end date based on interval
      const startDate = new Date(subscription.currentPeriodStart);
      let newEndDate;
      
      if (subscription.interval === 'monthly') {
        newEndDate = new Date(startDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (subscription.interval === 'yearly') {
        newEndDate = new Date(startDate);
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      } else {
        // Default to 30 days
        newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 30);
      }
      
      // Update the subscription
      const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'active', // Change status to active
          currentPeriodEnd: newEndDate // Set proper end date
        }
      });
      
      console.log(`Updated subscription:`);
      console.log(`New status: ${updatedSubscription.status}`);
      console.log(`New period: ${updatedSubscription.currentPeriodStart} to ${updatedSubscription.currentPeriodEnd}`);
      console.log('-----------------------------------\n');
    }
    
    console.log('Subscription repair completed!');
    
  } catch (error) {
    console.error('Error fixing subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
