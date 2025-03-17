import React from 'react';
import { AbstractIntlMessages } from 'next-intl';
import { ClientLocaleLayout } from '@/components/layout/client-locale-layout';
import { Metadata } from 'next';

/**
 * Generate metadata based on locale
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  // Get the locale from params
  const locale = params.locale;
  
  // Set locale-specific OpenGraph images
  const ogImagePath = locale === 'ar' ? '/og/home-og-ar.jpg' : '/og/home-og-en.jpg';
  
  return {
    openGraph: {
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: locale === 'ar' ? 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي' : 'Promptaat - Your AI Prompt Library',
        },
      ],
    },
    twitter: {
      images: [ogImagePath],
    },
  };
}

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
