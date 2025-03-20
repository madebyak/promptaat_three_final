import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for better code splitting and performance
const HeroSection = dynamic(() => import('@/components/faq/hero-section'), { ssr: true })
const FaqCategories = dynamic(() => import('@/components/faq/faq-categories'), { ssr: true })
const FaqSearch = dynamic(() => import('@/components/faq/faq-search'), { ssr: true })
const FaqAccordion = dynamic(() => import('@/components/faq/faq-accordion'), { ssr: true })
const ContactCta = dynamic(() => import('@/components/faq/contact-cta'), { ssr: true })

// Define the metadata for the page
export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'FAQ' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function FaqPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="w-full bg-white dark:bg-black-main text-gray-900 dark:text-white">
      <main className="min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <HeroSection locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <FaqCategories locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <FaqSearch locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <FaqAccordion locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <ContactCta locale={locale} />
        </Suspense>
      </main>
    </div>
  )
}
