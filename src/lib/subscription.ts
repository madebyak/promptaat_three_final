import { prisma } from "@/lib/prisma/client";

/**
 * Checks if a user has an active subscription
 * @param userId The user ID to check
 * @returns Boolean indicating if the user has an active subscription
 */
export async function isUserSubscribed(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Find active subscription - using case-insensitive status check
    // Also consider 'incomplete' status as valid since Stripe sometimes keeps this status
    // even after payment is complete
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        OR: [
          { status: "active" },
          { status: "Active" },
          { status: "incomplete" }, 
          { status: "trialing" },
          { status: "past_due" }, // Include past_due as users may still have access during grace period
          { status: { equals: "active", mode: "insensitive" } }
        ],
        currentPeriodEnd: {
          gt: new Date()
        }
      }
    });
    
    // If no subscription found with standard criteria, check for recent incomplete subscriptions
    // This helps with edge cases where the webhook hasn't properly updated the end date
    if (!subscription) {
      const recentIncompleteSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: "incomplete",
          createdAt: {
            // Look for subscriptions created in the last 24 hours
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (recentIncompleteSubscription) {
        console.log(`Found recent incomplete subscription for user ${userId}`, {
          subscriptionId: recentIncompleteSubscription.id,
          createdAt: recentIncompleteSubscription.createdAt,
          status: recentIncompleteSubscription.status
        });
        
        // If the subscription is recent (created within last 24 hours), consider it valid
        // This gives time for webhook processing or manual verification
        return true;
      }
    }
    
    return !!subscription;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

/**
 * Gets the subscription details for a user
 * @param userId The user ID to check
 * @returns The subscription object or null if not found
 */
export async function getUserSubscription(userId: string) {
  if (!userId) return null;
  
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        OR: [
          { status: "active" },
          { status: "Active" },
          { status: "incomplete" },
          { status: "trialing" },
          { status: "past_due" }, // Include past_due as users may still have access during grace period
          { status: { equals: "active", mode: "insensitive" } }
        ],
        currentPeriodEnd: {
          gt: new Date()
        }
      },
      include: {
        price: {
          include: {
            plan: true
          }
        }
      }
    });
    
    // If no subscription found with standard criteria, check for recent incomplete subscriptions
    if (!subscription) {
      const recentIncompleteSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: "incomplete",
          createdAt: {
            // Look for subscriptions created in the last 24 hours
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          price: {
            include: {
              plan: true
            }
          }
        }
      });
      
      if (recentIncompleteSubscription) {
        return recentIncompleteSubscription;
      }
    }
    
    return subscription;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
}
