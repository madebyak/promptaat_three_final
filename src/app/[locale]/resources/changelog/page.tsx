import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/container'
import ChangelogList from './components/changelog-list'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'سجل التغييرات | برومتات' : 'Changelog | Promptaat',
    description: locale === 'ar' 
      ? 'ابق على اطلاع بأحدث الميزات والتحسينات وإصلاحات الأخطاء لبروميتات.' 
      : 'Stay updated with the latest features, improvements, and bug fixes for Promptaat.',
  }
}

export default async function ChangelogPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const title = locale === 'ar' ? 'سجل التغييرات' : 'Changelog'
  const description = locale === 'ar'
    ? 'ابق على اطلاع بأحدث الميزات والتحسينات وإصلاحات الأخطاء'
    : 'Stay updated with the latest features, improvements, and bug fixes'
  const subtext = locale === 'ar' 
    ? 'نحن نعمل باستمرار على تحسين برومتات مع ميزات جديدة وتحسينات في الأداء وإصلاحات للأخطاء.'
    : 'We\'re continuously improving Promptaat with new features, performance enhancements, and bug fixes.'

  return (
    <main className="bg-black-main text-white-pure">
      <Container className="py-10 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            {title}
          </h1>
          <p className="text-light-grey text-lg md:text-xl">
            {description}
          </p>
          <p className="text-light-grey text-lg max-w-4xl mx-auto">
            {subtext}
          </p>
        </div>
        
        {/* Content Section */}
        <div className="max-w-5xl mx-auto">
          <hr className="border-light-dark-grey mb-10" />
          <ChangelogList locale={locale} />
        </div>
      </Container>
    </main>
  )
}
