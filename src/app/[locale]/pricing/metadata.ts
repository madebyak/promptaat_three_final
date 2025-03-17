import { Metadata } from 'next'

interface GenerateMetadataProps {
  params: { locale: string }
}

/**
 * Generate dynamic metadata for the pricing page based on locale
 */
export async function generateMetadata(
  { params }: GenerateMetadataProps
): Promise<Metadata> {
  const { locale } = params
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
  
  // Arabic metadata
  if (isArabic) {
    return {
      ...baseMetadata,
      title: 'خطط وأسعار برومتات | أكبر مكتبة للموجهات الذكية',
      description: 'استكشف خطط أسعار برومتات وميزاتها. اختر بين الباقة المجانية أو الاشتراك شهريًا أو ربع سنويًا أو سنويًا لتحصل على وصول كامل إلى مكتبة بروبتات الذكاء الاصطناعي.',
      keywords: [
        'أسعار برومتات', 
        'اشتراك برومتات', 
        'خطط برومتات', 
        'ميزات برومتات', 
        'الذكاء الاصطناعي',
        'موجهات الذكاء الاصطناعي',
        'شات جي بي تي',
        'جيميني',
        'كلود'
      ],
      openGraph: {
        title: 'خطط وأسعار برومتات | أكبر مكتبة للموجهات الذكية',
        description: 'استكشف خطط أسعار برومتات وميزاتها. ابدأ مجانًا أو اشترك للحصول على وصول كامل إلى بروبتات الذكاء الاصطناعي.',
        locale: 'ar_SA',
        type: 'website',
        url: `https://promptaat.com/ar/pricing`,
        siteName: 'برومتات',
      },
      twitter: {
        card: 'summary',
        title: 'خطط وأسعار برومتات | أكبر مكتبة للموجهات الذكية',
        description: 'استكشف خطط أسعار برومتات وميزاتها. ابدأ مجانًا أو اشترك للحصول على وصول كامل.',
      },
    }
  }
  
  // Default to English metadata
  return {
    ...baseMetadata,
    title: 'Promptaat Pricing Plans | The Largest AI Prompt Library',
    description: 'Explore Promptaat pricing plans and features. Choose between free, monthly, quarterly or annual subscriptions for full access to our AI prompt library.',
    keywords: [
      'Promptaat pricing', 
      'AI prompt subscription', 
      'Promptaat plans', 
      'Promptaat features', 
      'AI Prompts',
      'ChatGPT Prompts',
      'Top Prompts',
      'Advance Prompt',
      'Claude AI Prompts'
    ],
    openGraph: {
      title: 'Promptaat Pricing Plans | The Largest AI Prompt Library',
      description: 'Explore Promptaat pricing plans and features. Start for free or subscribe for full access to premium AI prompts.',
      locale: 'en_US',
      type: 'website',
      url: `https://promptaat.com/en/pricing`,
      siteName: 'Promptaat',
    },
    twitter: {
      card: 'summary',
      title: 'Promptaat Pricing Plans | The Largest AI Prompt Library',
      description: 'Explore Promptaat pricing plans and features. Start for free or subscribe for full access.',
    },
  }
}
