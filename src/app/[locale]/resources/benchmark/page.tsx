import { Metadata } from 'next'
import BenchmarkHero from './components/hero'
import MetricsDashboard from './components/metrics-dashboard'
import IndustryCoverage from './components/industry-coverage'
import AccuracySection from './components/accuracy-section'
import { QualitySection } from './components/quality-section'
import { TimeSection } from './components/time-section'
import { SatisfactionSection } from './components/satisfaction-section'
import { CreativitySection } from './components/creativity-section'
import { ImprovementSection } from './components/improvement-section'
import { SubFooter } from '@/components/layout/sub-footer'
import { getMetricsData } from './components/metric-data'
import { BenchmarkStructuredData } from '@/components/seo/structured-data'
import BenchmarkFAQSection from '@/components/benchmark/faq-section'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'المقاييس المعيارية | برومتات' : 'AI Prompt Performance Benchmarks | Promptaat',
    description: locale === 'ar' 
      ? 'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع.' 
      : 'Explore comprehensive AI prompt performance data: 92% accuracy, 87% quality score, 63% time efficiency, and more metrics that set Promptaat apart.',
    keywords: ['AI benchmarks', 'prompt performance', 'AI accuracy metrics', 'prompt quality score', 'AI efficiency data'],
    openGraph: {
      title: locale === 'ar' ? 'المقاييس المعيارية | برومتات' : 'AI Prompt Performance Benchmarks | Promptaat',
      description: locale === 'ar' 
        ? 'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع.' 
        : 'Explore comprehensive AI prompt performance data: 92% accuracy, 87% quality score, 63% time efficiency, and more metrics that set Promptaat apart.',
      url: `https://promptaat.com/${locale}/resources/benchmark`,
      type: 'article',
      images: [
        {
          url: locale === 'ar' ? '/og/benchmark-og-ar.jpg' : '/og/benchmark-og-en.jpg',
          width: 1200,
          height: 630,
          alt: 'Promptaat Benchmarks',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'ar' ? 'المقاييس المعيارية | برومتات' : 'AI Prompt Performance Benchmarks | Promptaat',
      description: locale === 'ar' 
        ? 'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع.' 
        : 'Explore comprehensive AI prompt performance data: 92% accuracy, 87% quality score, 63% time efficiency, and more metrics that set Promptaat apart.',
      images: [locale === 'ar' ? '/og/benchmark-og-ar.jpg' : '/og/benchmark-og-en.jpg'],
    },
    alternates: {
      canonical: 'https://promptaat.com/resources/benchmark',
      languages: {
        'en': 'https://promptaat.com/en/resources/benchmark',
        'ar': 'https://promptaat.com/ar/resources/benchmark',
      },
    },
  }
}

export default async function BenchmarkPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const title = locale === 'ar' ? 'المقاييس المعيارية' : 'Benchmarks'
  const description = locale === 'ar'
    ? 'تفوق برومتات في كل المقاييس'
    : 'Promptaat excellence across all metrics'
  const subtext = locale === 'ar' 
    ? 'اكتشف كيف تؤدي منصتنا بشكل متفوق عبر مجموعة من المقاييس العالمية، من الدقة إلى الإبداع، وكيف نقود الصناعة في تقديم حلول ذكاء اصطناعي عالية الجودة.'
    : 'Discover how our platform performs exceptionally across a range of global metrics, from accuracy to creativity, and how we lead the industry in delivering high-quality AI solutions.'

  const metricsData = getMetricsData(locale)

  return (
    <>
      <BenchmarkStructuredData />
      <main className="bg-light-white dark:bg-black-main text-dark-dark-grey dark:text-white-pure">
        {/* Hero Section */}
        <BenchmarkHero 
          title={title}
          description={description}
          subtext={subtext}
          isRTL={locale === 'ar'}
        />
        
        {/* Metrics Dashboard Section */}
        <MetricsDashboard 
          metrics={metricsData}
          isRTL={locale === 'ar'}
        />
        
        {/* Industry Coverage Section */}
        <IndustryCoverage isRTL={locale === 'ar'} />
        
        {/* Accuracy Section */}
        <AccuracySection isRTL={locale === 'ar'} />
        
        {/* Quality Section */}
        <QualitySection isRTL={locale === 'ar'} />
        
        {/* Time Efficiency Section */}
        <TimeSection isRTL={locale === 'ar'} />
        
        {/* User Satisfaction Section */}
        <SatisfactionSection isRTL={locale === 'ar'} />
        
        {/* Creativity Section */}
        <CreativitySection isRTL={locale === 'ar'} />
        
        {/* FAQ Section - Added for SEO enhancement */}
        <BenchmarkFAQSection />
        
        {/* Improvement Call to Action Section */}
        <ImprovementSection isRTL={locale === 'ar'} />
        
        {/* Sub Footer */}
        <SubFooter locale={locale} />
      </main>
    </>
  )
}
