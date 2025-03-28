import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic imports for better code splitting and performance
const FeatureRequestHero = dynamic(() => import('@/components/feature-request/hero-section'), { ssr: true })
const FeatureRequestForm = dynamic(() => import('@/components/feature-request/request-form'), { ssr: true })

// Define the metadata for the page
export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'FeatureRequest' })
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default function FeatureRequestPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="w-full bg-white dark:bg-black-main text-gray-900 dark:text-white">
      <main className="min-h-screen">
        <Suspense fallback={<div>Loading...</div>}>
          <FeatureRequestHero locale={locale} />
        </Suspense>
        
        <Suspense fallback={<div>Loading...</div>}>
          <FeatureRequestForm locale={locale} />
        </Suspense>
      </main>
    </div>
  )
}
