import { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Twitter, Instagram, BookOpen } from 'lucide-react'
import Link from 'next/link'

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
  
  const comingSoonText = locale === 'ar'
    ? 'نحن نعمل على إنشاء وثائق شاملة لمساعدتك في استخدام بروميتات بأفضل طريقة ممكنة.'
    : 'We are building comprehensive documentation to help you get the most out of Promptaat.'
    
  const stayTunedText = locale === 'ar'
    ? 'ترقبوا التحديثات القادمة!'
    : 'Stay tuned for updates!'
    
  const followUsText = locale === 'ar'
    ? 'تابعنا على وسائل التواصل الاجتماعي للحصول على آخر الأخبار والتحديثات:'
    : 'Follow us on social media for the latest news and updates:'

  return (
    <Container className="py-10 md:py-16">
      <PageHeader
        title={title}
        description={description}
        className="text-center mb-12"
      />
      
      <div className="max-w-3xl mx-auto bg-black-secondary/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <div className="flex flex-col items-center text-center space-y-6">
          <BookOpen className="w-16 h-16 text-primary mb-2" />
          
          <h2 className="text-2xl font-bold text-black-main dark:text-white-pure">
            {comingSoonText}
          </h2>
          
          <p className="text-lg text-mid-grey dark:text-light-grey">
            {stayTunedText}
          </p>
          
          <div className="w-24 h-1 bg-primary/50 rounded-full my-4"></div>
          
          <p className="text-md text-black-main dark:text-white-pure">
            {followUsText}
          </p>
          
          <div className="flex space-x-4 rtl:space-x-reverse mt-4">
            <Link href="https://twitter.com/promptaat" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary transition-all">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </Link>
            <Link href="https://instagram.com/promptaat" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/20 hover:text-primary transition-all">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
