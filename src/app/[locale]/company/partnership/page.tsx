import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for better code splitting and performance
const HeroSection = dynamic(() => import('@/components/partnership/hero-section'), { ssr: true })
const PartnershipTypes = dynamic(() => import('@/components/partnership/partnership-types'), { ssr: true })
const PartnershipBenefits = dynamic(() => import('@/components/partnership/partnership-benefits'), { ssr: true })
const PartnershipProcess = dynamic(() => import('@/components/partnership/partnership-process'), { ssr: true })
const ContactForm = dynamic(() => import('@/components/partnership/contact-form'), { ssr: true })

// Define the metadata for the page
export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Partnership' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function PartnershipPage({
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
          <PartnershipTypes locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <PartnershipBenefits locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <PartnershipProcess locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <ContactForm locale={locale} />
        </Suspense>
      </main>
    </div>
  )
}
