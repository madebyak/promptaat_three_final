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

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'المقاييس المعيارية | برومتات' : 'Benchmarks | Promptaat',
    description: locale === 'ar' 
      ? 'اكتشف كيف تتفوق برومتات في المقاييس المعيارية للدقة والجودة والكفاءة الزمنية ورضا المستخدم والإبداع.' 
      : 'Discover how Promptaat excels in benchmarks for accuracy, quality, time efficiency, user satisfaction, and creativity.',
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

  // Get metrics data based on locale
  const metricsData = getMetricsData(locale)

  return (
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
      
      {/* Improvement Call to Action Section */}
      <ImprovementSection isRTL={locale === 'ar'} />
      
      {/* Sub Footer */}
      <SubFooter locale={locale} />
    </main>
  )
}
