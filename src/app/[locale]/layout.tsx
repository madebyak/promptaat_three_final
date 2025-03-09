import React from 'react';
import { AbstractIntlMessages } from 'next-intl';
import { ClientLocaleLayout } from '@/components/layout/client-locale-layout';

/**
 * Server component that handles the params Promise and locale messages loading
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Resolve the params Promise server-side
  const resolvedParams = await params;
  
  // Pre-load messages on the server
  let messages: AbstractIntlMessages = {};
  try {
    messages = (await import(`../../../messages/${resolvedParams.locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${resolvedParams.locale}`, error);
  }
  
  // Pass the resolved params and messages to the client component
  return (
    <ClientLocaleLayout locale={resolvedParams.locale} messages={messages}>
      {children}
    </ClientLocaleLayout>
  );
}
