// normalize-subscription-status.js
// This script normalizes all subscription status values to lowercase
// to fix case sensitivity issues with Stripe webhook events

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function normalizeSubscriptionStatus() {
  console.log('Starting subscription status normalization...');
  
  try {
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany();
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    // Track changes
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    
    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        // Check if status needs normalization
        if (subscription.status && subscription.status !== subscription.status.toLowerCase()) {
          console.log(`Normalizing subscription ${subscription.id}: "${subscription.status}" -> "${subscription.status.toLowerCase()}"`);
          
          // Update the subscription status to lowercase
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: subscription.status.toLowerCase() }
          });
          
          updated++;
        } else {
          unchanged++;
        }
      } catch (error) {
        console.error(`Error updating subscription ${subscription.id}:`, error);
        errors++;
      }
    }
    
    // Summary
    console.log('\nNormalization complete:');
    console.log(`- Total subscriptions: ${subscriptions.length}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Already normalized: ${unchanged}`);
    console.log(`- Errors: ${errors}`);
    
  } catch (error) {
    console.error('Error during normalization process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the normalization
normalizeSubscriptionStatus()
  .then(() => console.log('Script completed'))
  .catch(error => console.error('Script failed:', error));
