import { Metadata } from 'next'

interface GenerateMetadataProps {
  params: { locale: string }
}

/**
 * Generate locale-specific metadata for the pricing page
 * This provides rich, SEO-optimized metadata for search engines
 */
export function generateMetadata({ params }: GenerateMetadataProps): Metadata {
  const locale = params.locale
  const isArabic = locale === 'ar'
  
  // Base metadata that's common across locales
  const baseMetadata = {
    metadataBase: new URL('https://promptaat.com'),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: {
        'en': '/en/pricing',
        'ar': '/ar/pricing',
      },
    },
  }
  
  // Locale-specific metadata
  if (isArabic) {
    return {
      ...baseMetadata,
      title: 'خطط وأسعار برومبتات - اختر الخطة المناسبة لك',
      description: 'استكشف خطط أسعار برومبتات وميزاتها. اختر بين الباقة المجانية أو الاشتراك شهريًا أو ربع سنويًا أو سنويًا لتحصل على وصول كامل إلى مكتبة بروبتات الذكاء الاصطناعي.',
      keywords: ['أسعار برومبتات', 'اشتراك برومبتات', 'خطط برومبتات', 'ميزات برومبتات', 'الذكاء الاصطناعي'],
      openGraph: {
        title: 'خطط وأسعار برومبتات - اختر الخطة المناسبة لك',
        description: 'استكشف خطط أسعار برومبتات وميزاتها. ابدأ مجانًا أو اشترك للحصول على وصول كامل إلى بروبتات الذكاء الاصطناعي.',
        locale: 'ar_SA',
        type: 'website',
        url: 'https://promptaat.com/ar/pricing',
        siteName: 'برومبتات',
        images: [
          {
            url: 'https://promptaat.com/pricing-ar.png',
            width: 1200,
            height: 630,
            alt: 'خطط وأسعار برومبتات',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'خطط وأسعار برومبتات - اختر الخطة المناسبة لك',
        description: 'استكشف خطط أسعار برومبتات وميزاتها. ابدأ مجانًا أو اشترك للحصول على وصول كامل.',
        images: ['https://promptaat.com/pricing-ar.png'],
      },
    }
  }
  
  // Default to English metadata
  return {
    ...baseMetadata,
    title: 'Promptaat Pricing Plans - Choose Your Perfect Plan',
    description: 'Explore Promptaat pricing plans and features. Choose between free, monthly, quarterly or annual subscriptions for full access to our AI prompt library.',
    keywords: ['Promptaat pricing', 'AI prompt subscription', 'Promptaat plans', 'Promptaat features', 'AI prompts'],
    openGraph: {
      title: 'Promptaat Pricing Plans - Choose Your Perfect Plan',
      description: 'Explore Promptaat pricing plans and features. Start for free or subscribe for full access to premium AI prompts.',
      locale: 'en_US',
      type: 'website',
      url: 'https://promptaat.com/en/pricing',
      siteName: 'Promptaat',
      images: [
        {
          url: 'https://promptaat.com/pricing.png',
          width: 1200,
          height: 630,
          alt: 'Promptaat Pricing Plans',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Promptaat Pricing Plans - Choose Your Perfect Plan',
      description: 'Explore Promptaat pricing plans and features. Start for free or subscribe for full access.',
      images: ['https://promptaat.com/pricing.png'],
    },
  }
}
