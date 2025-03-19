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
    title: locale === 'ar' ? 'المدونة | بروميتات' : 'Blog | Promptaat',
    description: locale === 'ar' 
      ? 'اقرأ أحدث المقالات والأخبار حول هندسة موجهات الذكاء الاصطناعي وأفضل الممارسات.' 
      : 'Read the latest articles and news about AI prompt engineering and best practices.',
  }
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const title = locale === 'ar' ? 'المدونة' : 'Blog'
  const description = locale === 'ar'
    ? 'اقرأ أحدث المقالات والأخبار حول هندسة موجهات الذكاء الاصطناعي وأفضل الممارسات.'
    : 'Read the latest articles and news about AI prompt engineering and best practices.'

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
            ? 'محتوى المدونة قيد الإنشاء. يرجى العودة قريبًا.'
            : 'Blog content is under development. Please check back soon.'}
        </p>
      </div>
    </Container>
  )
}
