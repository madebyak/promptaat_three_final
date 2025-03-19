'use client'

import { HelpCircleIcon, LifeBuoyIcon, ArrowDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactHeroProps {
  locale: string
  onSupportClick?: () => void
}

export default function ContactHero({ locale, onSupportClick }: ContactHeroProps) {
  const isRTL = locale === 'ar'
  
  const handleSupportClick = () => {
    // Scroll to the support form section
    const supportForm = document.getElementById('support-form')
    if (supportForm) {
      supportForm.scrollIntoView({ behavior: 'smooth' })
    }
    // Also call the parent's onSupportClick if provided
    if (onSupportClick) {
      onSupportClick()
    }
  }
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      <div className="max-w-7xl mx-auto">
        {/* Headline and subheading */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 ${isRTL ? 'rtl' : ''}`}>
            {isRTL ? 'تواصل معنا' : 'Get in Touch'}
          </h1>
          <p className={`text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto ${isRTL ? 'rtl' : ''}`}>
            {isRTL 
              ? 'نحن هنا للإجابة على أسئلتك وتقديم الدعم لك. اختر الطريقة التي تناسبك للتواصل معنا.'
              : 'We\'re here to answer your questions and provide support. Choose the option that works best for you.'}
          </p>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ${isRTL ? 'md:rtl' : ''}`}>
          
          {/* FAQ Card */}
          <div className="bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <HelpCircleIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${isRTL ? 'text-right' : ''} text-gray-900 dark:text-white`}>
                  {isRTL ? 'هل لديك سؤال؟' : 'Have a question?'}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 mb-6 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL 
                    ? 'قد تحتوي صفحة الأسئلة الشائعة لدينا بالفعل على الإجابة التي تحتاجها.'
                    : 'Our FAQ page might already have the answer you need.'}
                </p>
              </div>
              <div className="mt-auto">
                <Button 
                  variant="default"
                  className={`w-full justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
                  asChild
                >
                  <a href={`/${locale}/company/faq`}>
                    {isRTL ? 'مشاهدة جميع الأسئلة الشائعة' : 'See all FAQs'}
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Support Card */}
          <div className="bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
                  <LifeBuoyIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${isRTL ? 'text-right' : ''} text-gray-900 dark:text-white`}>
                  {isRTL ? 'بحاجة إلى دعم؟' : 'Need support?'}
                </h3>
                <p className={`text-gray-600 dark:text-gray-300 mb-6 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL 
                    ? 'للدعم الفني أو الملاحظات أو أسئلة الفواتير، قم بزيارة صفحة الدعم.'
                    : 'For technical support, feedback, or billing questions, visit our support page.'}
                </p>
              </div>
              <div className="mt-auto">
                <Button 
                  variant="default"
                  className={`w-full justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
                  onClick={handleSupportClick}
                >
                  <span>{isRTL ? 'الحصول على الدعم' : 'Get support'}</span>
                  <ArrowDownIcon className={`ml-2 h-4 w-4 ${isRTL ? 'mr-2 ml-0' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}
