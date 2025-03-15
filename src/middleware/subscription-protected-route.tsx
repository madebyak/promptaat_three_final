'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Spinner } from '@/components/ui/spinner';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * Client component that wraps routes requiring an active subscription
 * Redirects to subscription page if user doesn't have an active subscription
 */
export function SubscriptionProtectedRoute({ 
  children, 
  locale = 'en'
}: SubscriptionProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check subscription if user is authenticated
    if (status === 'authenticated' && session?.user) {
      const checkSubscription = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/subscriptions');
          
          if (!response.ok) {
            throw new Error('Failed to fetch subscription data');
          }
          
          const data = await response.json();
          // If user has an active subscription
          setHasSubscription(!!data.subscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
          setHasSubscription(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkSubscription();
    } else if (status === 'unauthenticated') {
      // If user is not authenticated
      setIsLoading(false);
      setHasSubscription(false);
    }
  }, [status, session, router]);

  // Show loading state while checking subscription
  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">
          {locale === 'ar' ? 'جارِ التحقق من اشتراكك...' : 'Verifying your subscription...'}
        </p>
      </div>
    );
  }

  // If user has subscription, show the protected content
  if (hasSubscription) {
    return <>{children}</>;
  }

  // If user is authenticated but doesn't have subscription, show upgrade prompt
  if (status === 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white p-4 rounded-full mb-6">
          <Crown className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-3">
          {locale === 'ar' ? 'الوصول مقيد للمشتركين فقط' : 'Pro Subscribers Only'}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {locale === 'ar' 
            ? 'هذه الميزة متاحة فقط لمشتركي الخطة المميزة. يرجى الترقية للوصول.' 
            : 'This feature is only available to Pro subscribers. Please upgrade to access.'}
        </p>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-green-500 text-white"
          asChild
        >
          <Link href={`/${locale}/subscription`}>
            {locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
          </Link>
        </Button>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
  
  // Return loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-muted-foreground">
        {locale === 'ar' ? 'جارِ التوجيه إلى صفحة تسجيل الدخول...' : 'Redirecting to login...'}
      </p>
    </div>
  );
}
