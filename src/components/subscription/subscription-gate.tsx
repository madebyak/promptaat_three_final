import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { ProUpgradeMessage } from "./pro-upgrade-message";

interface SubscriptionGateProps {
  children: React.ReactNode;
  locale: string;
  fallbackUrl?: string;
}

/**
 * Server component that checks if the user has an active subscription.
 * If not, it shows an upgrade message or redirects to the specified URL.
 */
export async function SubscriptionGate({ 
  children, 
  locale,
  fallbackUrl
}: SubscriptionGateProps) {
  // Get the current session
  const session = await getServerSession(authOptions);
  
  // If user is not authenticated, redirect to login
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(fallbackUrl || `/api/auth/signin`);
    redirect(`/${locale}/auth/login?callbackUrl=${callbackUrl}`);
  }
  
  // Check if user has an active subscription
  const hasSubscription = await isUserSubscribed(session.user.id);
  
  // If user has subscription, show the protected content
  if (hasSubscription) {
    return <>{children}</>;
  }
  
  // Otherwise, show upgrade message or redirect
  if (fallbackUrl) {
    redirect(fallbackUrl);
  }
  
  // Show upgrade message
  return <ProUpgradeMessage locale={locale} />;
}
