"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PaymentSuccessPopup } from "@/components/payment/payment-success-popup";
import React from "react";

interface PageParams {
  locale: string;
}

export default function SubscriptionSuccessPage({
  params,
}: {
  params: PageParams;
}) {
  const { locale } = React.use(params as unknown as Promise<PageParams>);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const t = useTranslations("Checkout");
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and session ID is valid
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push(`/${locale}/auth/signin`);
        return;
      }
      
      if (!sessionId) {
        // If no session ID, redirect to homepage
        router.push(`/${locale}`);
        return;
      }
      
      // In a real implementation, you would verify the session with Stripe
      // For now, we'll just simulate a successful subscription verification
      setTimeout(() => {
        setIsLoading(false);
        setIsSessionChecked(true);
      }, 1000);
    };

    checkSession();
  }, [locale, router, sessionId]);

  useEffect(() => {
    // Redirect to homepage if popup is closed
    if (!isPopupOpen && isSessionChecked && !isLoading) {
      router.push(`/${locale}`);
    }
  }, [isPopupOpen, isSessionChecked, isLoading, locale, router]);

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Only show popup once loading is complete and session is verified
  return (
    <>
      {!isLoading && isSessionChecked && (
        <PaymentSuccessPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          locale={locale}
          t={t}
        />
      )}
    </>
  );
}
