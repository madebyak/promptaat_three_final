import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'

// Use dynamic imports to fix the module resolution issues
const HeroSection = dynamic(() => import('../../../../components/about-us/hero-section'), { ssr: true })
const OurVision = dynamic(() => import('../../../../components/about-us/our-vision'), { ssr: true })
const ProblemSolution = dynamic(() => import('../../../../components/about-us/problem-solution'), { ssr: true })
const OurApproach = dynamic(() => import('../../../../components/about-us/our-approach'), { ssr: true })
// Import SubFooter directly since it's a named export
import { SubFooter } from '../../../../components/layout/sub-footer'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'AboutUs' })

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function AboutUsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  return (
    <div className="w-full bg-white dark:bg-black-main text-gray-900 dark:text-white">
      {/* Hero Section with dot pattern, app icon, headline and introduction */}
      <HeroSection locale={locale} />
      
      {/* Our Vision Section */}
      <OurVision locale={locale} />
      
      {/* Problem & Solution Section */}
      <ProblemSolution locale={locale} />
      
      {/* Our Approach Section */}
      <OurApproach locale={locale} />
      
      {/* Sub-footer */}
      <SubFooter locale={locale} />
    </div>
  )
}
