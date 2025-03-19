import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/ui/container'
import { PageHeader } from '@/components/ui/page-header'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'المستندات | بروميتات' : 'Documentation | Promptaat',
    description: locale === 'ar' 
      ? 'استكشف مستندات بروميتات لفهم كيفية استخدام منصتنا بشكل فعال.' 
      : 'Explore Promptaat documentation to understand how to effectively use our platform.',
  }
}

export default async function DocsPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const title = locale === 'ar' ? 'المستندات' : 'Documentation'
  const description = locale === 'ar'
    ? 'استكشف مستندات بروميتات لفهم كيفية استخدام منصتنا بشكل فعال.'
    : 'Explore Promptaat documentation to understand how to effectively use our platform.'

  return (
    <Container className="py-10 md:py-16">
      <PageHeader
        title={title}
        description={description}
        className="text-center mb-12"
      />
      
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-center">
          {locale === 'ar' 
            ? 'محتوى المستندات قيد الإنشاء. يرجى العودة قريبًا.'
            : 'Documentation content is under development. Please check back soon.'}
        </p>
      </div>
    </Container>
  )
}
