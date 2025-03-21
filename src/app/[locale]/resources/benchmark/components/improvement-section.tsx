import React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface ImprovementSectionProps {
  isRTL?: boolean
}

export function ImprovementSection({ isRTL = false }: ImprovementSectionProps) {
  // Translations
  const title = isRTL 
    ? 'نحن في مهمة للتحسين المستمر' 
    : 'We\'re on a Mission to Keep Improving'
  
  const description = isRTL 
    ? 'في بروبتات، نسعى دائمًا لتحسين خدماتنا وتطوير منتجاتنا. نحن نؤمن بأن التطوير المستمر هو المفتاح لتقديم أفضل تجربة ممكنة لمستخدمينا. نحن نقدر آراءكم واقتراحاتكم ونعتبرها جزءًا أساسيًا من رحلة التحسين.'
    : 'At Promptaat, we\'re constantly striving to enhance our services and evolve our products. We believe that continuous improvement is key to delivering the best possible experience for our users. We value your feedback and suggestions and consider them an essential part of our improvement journey.'
  
  const subtext = isRTL 
    ? 'انضم إلينا في هذه الرحلة وساعدنا على تحسين خدماتنا من خلال مشاركة أفكارك واقتراحاتك.'
    : 'Join us on this journey and help us improve our services by sharing your ideas and suggestions.'
  
  const buttonText = isRTL 
    ? 'شارك اقتراحاتك' 
    : 'Share Your Suggestions'

  return (
    <section className="py-20 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 dark:from-black-main via-light-grey-light/50 dark:via-dark/20 to-white/90 dark:to-black-main opacity-70"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Container>
        <div className={cn(
          "flex flex-col items-center text-center max-w-4xl mx-auto relative z-10",
          isRTL && "rtl"
        )}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-purple dark:from-accent-purple to-accent-blue dark:to-accent-blue">
              {title}
            </span>
          </h2>
          
          <p className="text-mid-grey dark:text-light-grey text-lg mb-8 max-w-3xl">
            {description}
          </p>
          
          <p className="text-black-main dark:text-white-pure text-xl font-medium mb-10">
            {subtext}
          </p>
          
          <Link href={`/${isRTL ? 'ar' : 'en'}/resources/feature-requests`} passHref>
            <Button 
              className="bg-accent-purple hover:bg-accent-purple/90 text-black-main dark:text-white-pure px-8 py-6 text-lg rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-glow"
            >
              {!isRTL && buttonText}
              {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              {isRTL && buttonText}
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
