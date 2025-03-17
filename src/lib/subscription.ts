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
          { status: "incomplete" }, // Include incomplete status
          { status: { equals: "active", mode: "insensitive" } }
        ],
        currentPeriodEnd: {
          gt: new Date()
        }
      }
    });
    
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
    return await prisma.subscription.findFirst({
      where: {
        userId: userId,
        OR: [
          { status: "active" },
          { status: "Active" },
          { status: "incomplete" }, // Include incomplete status
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
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
}
