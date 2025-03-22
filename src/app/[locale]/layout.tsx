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
    title: 'Promptaat | The Largest AI Prompt Library',
    description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast, engineered collection saves you time—just copy and paste to fuel your ideas, letting you focus on the details that matter.',
    openGraph: {
      title: 'Promptaat | The Largest AI Prompt Library',
      description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast, engineered collection saves you time—just copy and paste to fuel your ideas, letting you focus on the details that matter.',
      url: `${baseUrl}/${locale}`,
      type: 'website',
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: 'Promptaat | The Largest AI Prompt Library',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Promptaat | The Largest AI Prompt Library',
      description: 'In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat\'s vast collection saves you time with one-click solutions.',
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
