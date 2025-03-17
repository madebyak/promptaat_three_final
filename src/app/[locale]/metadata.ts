import { Metadata } from 'next'

interface GenerateMetadataProps {
  params: { locale: string }
}

/**
 * Generate locale-specific metadata for the home page
 */
export function generateMetadata({ params }: GenerateMetadataProps): Metadata {
  const locale = params.locale
  const isArabic = locale === 'ar'
  
  // Base metadata that's common across locales
  const baseMetadata = {
    metadataBase: new URL('https://promptaat.com'),
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'ar': '/ar',
      },
    },
  }
  
  // Locale-specific metadata
  if (isArabic) {
    return {
      ...baseMetadata,
      title: 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي',
      description: 'اكتشف واستخدم أفضل بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد. بروبتات للأعمال والكتابة والإبداع والإنتاجية.',
      keywords: ['بروبتات الذكاء الاصطناعي', 'شات جي بي تي', 'مكتبة البروبتات', 'ذكاء اصطناعي', 'جيميني', 'كلود'],
      openGraph: {
        title: 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي',
        description: 'اكتشف واستخدم أفضل بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد.',
        locale: 'ar_SA',
        alternateLocale: 'en_US',
        url: 'https://promptaat.com/ar',
        siteName: 'برومبتات',
        images: [
          {
            url: 'https://promptaat.com/og-image-ar.png',
            width: 1200,
            height: 630,
            alt: 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'برومبتات - مكتبة بروبتات الذكاء الاصطناعي',
        description: 'اكتشف واستخدم أفضل بروبتات الذكاء الاصطناعي لـ ChatGPT وGemini وClaude والمزيد.',
        images: ['https://promptaat.com/og-image-ar.png'],
      },
    }
  }
  
  // Default to English metadata
  return {
    ...baseMetadata,
    title: 'Promptaat - Your AI Prompt Library',
    description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more. Find prompts for business, writing, creativity, and productivity.',
    keywords: ['AI prompts', 'ChatGPT prompts', 'prompt library', 'AI assistant prompts', 'generative AI', 'prompt engineering'],
    openGraph: {
      title: 'Promptaat - Your AI Prompt Library',
      description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more. Find prompts for business, writing, creativity, and productivity.',
      locale: 'en_US',
      alternateLocale: 'ar_SA',
      url: 'https://promptaat.com/en',
      siteName: 'Promptaat',
      images: [
        {
          url: 'https://promptaat.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Promptaat - Your AI Prompt Library',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Promptaat - Your AI Prompt Library',
      description: 'Discover and use the best AI prompts for ChatGPT, Gemini, Claude and more.',
      images: ['https://promptaat.com/og-image.png'],
    },
  }
}
