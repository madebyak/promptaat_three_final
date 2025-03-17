import { Metadata } from 'next'

/**
 * Default SEO configuration values for the Promptaat application
 * This provides consistent defaults that can be extended by individual pages
 */
export const defaultSeo = {
  title: 'Promptaat - Your AI Prompt Library',
  description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more. Find prompts for business, writing, creativity, and productivity.',
  keywords: ['AI prompts', 'ChatGPT prompts', 'prompt library', 'AI assistant prompts', 'generative AI', 'prompt engineering'],
  ogImage: 'https://promptaat.com/og-image.png',
  locale: 'en_US',
  alternateLocale: 'ar_SA',
  siteUrl: 'https://promptaat.com',
}

/**
 * SEO configuration specifically for Arabic locale
 */
export const arabicSeo = {
  title: 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي',
  description: 'اكتشف واستخدم أفضل بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد. بروبتات للأعمال والكتابة والإبداع والإنتاجية.',
  locale: 'ar_SA',
  alternateLocale: 'en_US',
}

/**
 * SEO configuration generator for category pages
 */
export function generateCategorySeo(
  categoryName: string, 
  description: string, 
  locale: string = 'en'
): Metadata {
  const isArabic = locale === 'ar'
  const localizedTitle = isArabic 
    ? `${categoryName} | برومبتات` 
    : `${categoryName} | Promptaat`
  
  const localizedDescription = isArabic 
    ? `${description} | أفضل بروبتات الذكاء الاصطناعي في ${categoryName}` 
    : `${description} | Find the best AI prompts for ${categoryName}`
  
  return {
    title: localizedTitle,
    description: localizedDescription,
    openGraph: {
      title: localizedTitle,
      description: localizedDescription,
      locale: isArabic ? 'ar_SA' : 'en_US',
      alternateLocale: isArabic ? 'en_US' : 'ar_SA',
    },
    twitter: {
      title: localizedTitle,
      description: localizedDescription,
    }
  }
}

/**
 * SEO configuration for pages by locale
 */
export function getLocalizedSeo(
  locale: string,
  pageName?: string,
  customDescription?: string
): Metadata {
  const isArabic = locale === 'ar'
  const config = isArabic ? arabicSeo : defaultSeo
  
  const pageTitle = pageName 
    ? isArabic 
      ? `${pageName} | ${config.title}` 
      : `${pageName} | ${config.title}`
    : config.title
  
  const pageDescription = customDescription || config.description
  
  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      locale: config.locale,
      alternateLocale: config.alternateLocale,
      images: [
        {
          url: defaultSeo.ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      title: pageTitle,
      description: pageDescription,
      images: [defaultSeo.ogImage],
    },
  }
}
