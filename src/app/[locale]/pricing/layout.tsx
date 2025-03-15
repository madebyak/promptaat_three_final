"use client";

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useSession } from 'next-auth/react';
import { VerificationBanner } from '@/components/auth/verification-banner';
import { useParams } from 'next/navigation';

/**
 * Custom layout for the pricing page without sidebar
 */
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const needsVerification = session?.user?.emailVerified === false;
  
  return (
    <>
      {/* Use the existing Navbar */}
      <Navbar locale={locale} user={session?.user} />
      
      {/* Show verification banner if needed */}
      {needsVerification && session?.user?.email && (
        <VerificationBanner email={session.user.email} locale={locale} />
      )}
      
      {/* Full-width main content without sidebar */}
      <main className="flex-1 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </>
  );
}
