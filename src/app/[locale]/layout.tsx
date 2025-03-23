import React from 'react';
import { AbstractIntlMessages } from 'next-intl';
import { ClientLocaleLayout } from '@/components/layout/client-locale-layout';
import { Metadata, Viewport } from 'next';

/**
 * Generate metadata based on locale
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  // Get the locale from params - using Promise.resolve to ensure it's treated as async
  const locale = await Promise.resolve(params.locale);
  
  // Set locale-specific OpenGraph images with absolute URLs
  const baseUrl = 'https://promptaat.com';
  const ogImagePath = locale === 'ar' 
    ? `${baseUrl}/og/home-og-ar.jpg` 
    : `${baseUrl}/og/home-og-en.jpg`;
  
  // Define locale-specific metadata
  if (locale === 'ar') {
    return {
      title: 'برومتات - أكبر مكتبة للموجهات الذكية',
      description: 'في مستقبل يقوده الذكاء الاصطناعي، وقتك ثمين. مع برومتات ستحصل على أكبر مكتبة من الموجهات الجاهزة التي تتيح لك تركيز جهودك على إبداع المحتوى وتحقيق نتائج باهرة بنقرة واحدة.',
      openGraph: {
        title: 'برومتات - أكبر مكتبة للموجهات الذكية',
        description: 'في مستقبل يقوده الذكاء الاصطناعي، وقتك ثمين. مع برومتات ستحصل على أكبر مكتبة من الموجهات الجاهزة التي تتيح لك تركيز جهودك على إبداع المحتوى وتحقيق نتائج باهرة بنقرة واحدة.',
        url: `${baseUrl}/${locale}`,
        type: 'website',
        images: [
          {
            url: ogImagePath,
            width: 1200,
            height: 630,
            alt: 'برومتات - أكبر مكتبة للموجهات الذكية',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [ogImagePath],
        title: 'برومتات - أكبر مكتبة للموجهات الذكية',
        description: 'في مستقبل يقوده الذكاء الاصطناعي، وقتك ثمين. مع برومتات ستحصل على أكبر مكتبة من الموجهات الجاهزة لتحقيق نتائج باهرة بنقرة واحدة.',
      },
    };
  }
  
  // Default English metadata
  return {
    title: 'Promptaat - The Largest AI Prompt Library',
    description: 'In an AI-driven future, your time is valuable. Access the largest library of ready-to-use prompts, freeing you to focus on creating amazing content and achieving exceptional results with a single click.',
    openGraph: {
      title: 'Promptaat - The Largest AI Prompt Library',
      description: 'In an AI-driven future, your time is valuable. Access the largest library of ready-to-use prompts, freeing you to focus on creating amazing content and achieving exceptional results with a single click.',
      url: `${baseUrl}/${locale}`,
      type: 'website',
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: 'Promptaat - The Largest AI Prompt Library',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImagePath],
      title: 'Promptaat - The Largest AI Prompt Library',
      description: 'In an AI-driven future, your time is valuable. Access the largest library of ready-to-use prompts for exceptional results with a single click.',
    },
  };
}

/**
 * Define viewport metadata
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
