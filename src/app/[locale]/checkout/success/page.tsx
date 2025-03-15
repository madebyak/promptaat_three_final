'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { PaymentSuccessPopup } from '@/components/payment/payment-success-popup';
import React from 'react';

interface PageParams {
  locale: string;
}

export default function CheckoutSuccessPage({
  params,
}: {
  params: PageParams;
}) {
  const { locale } = React.use(params as unknown as Promise<PageParams>);
  const router = useRouter();
  const t = useTranslations('Checkout');
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Check if user is authenticated
      const currentSession = await getSession();
      
      if (!currentSession) {
        router.push(`/${locale}/auth/signin`);
        return;
      }
      
      // Use signIn to refresh the session with the current provider
      // This forces NextAuth to regenerate the session with latest database data
      await signIn('credentials', { 
        redirect: false,
        email: currentSession.user.email,
        // We're just refreshing, not actually logging in with credentials
        // This is a workaround to force session refresh
      });
      
      console.log('Session refreshed after successful subscription');
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [locale, router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    router.push(`/${locale}`);
  };

  return (
    <PaymentSuccessPopup
      isOpen={isPopupOpen}
      onClose={handleClosePopup}
      locale={locale}
      t={t}
      isLoading={isRefreshing}
    />
  );
}
