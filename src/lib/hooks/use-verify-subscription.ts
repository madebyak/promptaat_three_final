'use server';

import { cache } from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isUserSubscribed } from '@/lib/subscription';

/**
 * Server action to verify subscription status
 * @returns Object containing authentication and subscription status
 */
export const verifySubscription = cache(async (): Promise<{
  isAuthenticated: boolean;
  isSubscribed: boolean;
  userId?: string;
}> => {
  // Get the current session
  const session = await getServerSession(authOptions);
  
  // If no session, user is not authenticated
  if (!session?.user?.id) {
    return { 
      isAuthenticated: false, 
      isSubscribed: false 
    };
  }
  
  // Check if user has an active subscription
  const hasSubscription = await isUserSubscribed(session.user.id);
  
  return { 
    isAuthenticated: true, 
    isSubscribed: hasSubscription,
    userId: session.user.id 
  };
});

/**
 * Utility function to check if the current user can access pro content
 * @param isPro Whether the content is premium
 * @returns Boolean indicating if user can access the content
 */
export async function canAccessProContent(isPro: boolean): Promise<boolean> {
  // If content is not premium, always allow access
  if (!isPro) {
    return true;
  }
  
  // Otherwise, check subscription status
  const { isAuthenticated, isSubscribed } = await verifySubscription();
  
  // User must be authenticated and subscribed to access pro content
  return isAuthenticated && isSubscribed;
}
