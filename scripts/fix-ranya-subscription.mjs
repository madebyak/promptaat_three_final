import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const subscriptionId = 'b2689ca3-348b-481d-9ae7-330a8cbdd2cb';
    
    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });
    
    if (!currentSubscription) {
      console.log(`Subscription with ID ${subscriptionId} not found`);
      return;
    }
    
    console.log('Current subscription details:');
    console.log(JSON.stringify(currentSubscription, null, 2));
    
    // Calculate new period end date (30 days from now for monthly subscription)
    const newPeriodEnd = new Date();
    newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);
    
    // Update the subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        currentPeriodEnd: newPeriodEnd,
        // Keep the start date as is
        currentPeriodStart: currentSubscription.currentPeriodStart
      }
    });
    
    console.log('\nSubscription updated successfully:');
    console.log(JSON.stringify(updatedSubscription, null, 2));
    
    // Verify if the user would now be considered subscribed
    const user = await prisma.user.findUnique({
      where: { id: currentSubscription.userId },
      include: {
        subscriptions: true
      }
    });
    
    const activeSubscription = user.subscriptions.find(sub => {
      const isStatusValid = 
        sub.status === 'active' || 
        sub.status === 'Active' || 
        sub.status === 'incomplete' ||
        sub.status.toLowerCase() === 'active';
      
      const isPeriodValid = new Date(sub.currentPeriodEnd) > new Date();
      
      return isStatusValid && isPeriodValid;
    });
    
    console.log('\nSubscription status check after update:');
    console.log(`Would be considered subscribed: ${!!activeSubscription}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
