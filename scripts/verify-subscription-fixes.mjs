import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifies if a user would be considered subscribed based on our enhanced criteria
 */
async function checkSubscriptionStatus(userId, subscription) {
  // Check if subscription status is valid
  const isStatusValid = 
    subscription.status === 'active' || 
    subscription.status === 'Active' || 
    subscription.status === 'incomplete' ||
    subscription.status === 'trialing' ||
    subscription.status === 'past_due' ||
    subscription.status.toLowerCase() === 'active';
  
  // Check if period end is in the future
  const isPeriodValid = new Date(subscription.currentPeriodEnd) > new Date();
  
  // Check if it's a recent incomplete subscription (created within last 24 hours)
  const isRecentIncomplete = 
    subscription.status === 'incomplete' && 
    new Date(subscription.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return {
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
    periodStart: subscription.currentPeriodStart,
    periodEnd: subscription.currentPeriodEnd,
    isStatusValid,
    isPeriodValid,
    isRecentIncomplete,
    isSubscribed: isStatusValid && (isPeriodValid || isRecentIncomplete)
  };
}

async function main() {
  try {
    console.log('Subscription System Verification Report');
    console.log('======================================\n');
    
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    console.log(`Found ${subscriptions.length} total subscriptions in the database\n`);
    
    // Check each subscription
    const results = [];
    for (const subscription of subscriptions) {
      const result = await checkSubscriptionStatus(subscription.userId, subscription);
      result.userEmail = subscription.user?.email || 'Unknown';
      result.userName = `${subscription.user?.firstName || ''} ${subscription.user?.lastName || ''}`.trim() || 'Unknown';
      results.push(result);
    }
    
    // Display summary of subscription statuses
    console.log('Subscription Status Summary:');
    console.log('----------------------------');
    const statusCounts = {};
    results.forEach(result => {
      statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
    // Display active vs inactive subscriptions
    const activeCount = results.filter(r => r.isSubscribed).length;
    const inactiveCount = results.filter(r => !r.isSubscribed).length;
    
    console.log(`\nActive subscriptions: ${activeCount}`);
    console.log(`Inactive subscriptions: ${inactiveCount}`);
    
    // Display subscriptions with potential issues
    const potentialIssues = results.filter(r => {
      return (
        // Status is valid but period is invalid
        (r.isStatusValid && !r.isPeriodValid) ||
        // Incomplete status but not recent
        (r.status === 'incomplete' && !r.isRecentIncomplete)
      );
    });
    
    if (potentialIssues.length > 0) {
      console.log('\nSubscriptions with potential issues:');
      console.log('------------------------------------');
      
      potentialIssues.forEach(issue => {
        console.log(`\nUser: ${issue.userName} (${issue.userEmail})`);
        console.log(`Subscription ID: ${issue.subscriptionId}`);
        console.log(`Status: ${issue.status}`);
        console.log(`Period: ${new Date(issue.periodStart).toISOString()} to ${new Date(issue.periodEnd).toISOString()}`);
        console.log(`Issue: ${!issue.isPeriodValid ? 'End date not in future' : 'Incomplete status but not recent'}`);
      });
    } else {
      console.log('\nNo subscriptions with potential issues found!');
    }
    
    // Display recently fixed subscriptions (Ranya's subscription)
    const recentlyFixed = results.filter(r => 
      r.userEmail === 'ranya.hamawandy@gmail.com' && r.isSubscribed
    );
    
    if (recentlyFixed.length > 0) {
      console.log('\nRecently fixed subscriptions:');
      console.log('-----------------------------');
      
      recentlyFixed.forEach(fixed => {
        console.log(`\nUser: ${fixed.userName} (${fixed.userEmail})`);
        console.log(`Subscription ID: ${fixed.subscriptionId}`);
        console.log(`Status: ${fixed.status}`);
        console.log(`Period: ${new Date(fixed.periodStart).toISOString()} to ${new Date(fixed.periodEnd).toISOString()}`);
        console.log(`Is now considered subscribed: ${fixed.isSubscribed ? 'Yes' : 'No'}`);
      });
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
