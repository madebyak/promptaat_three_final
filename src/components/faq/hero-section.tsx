'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  locale: string
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const isRTL = locale === 'ar'
  
  const scrollToFaqSearch = () => {
    const faqSearchSection = document.getElementById('faq-search')
    if (faqSearchSection) {
      faqSearchSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  return (
    <section className="w-full min-h-[50vh] pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-accent-purple/20 to-light-grey-light dark:from-accent-purple/10 dark:to-black-main overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-30"></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-block bg-accent-purple/10 dark:bg-accent-purple/20 rounded-full px-4 py-2 mb-4">
            <span className="text-accent-purple font-medium text-sm">
              <bdi>{isRTL ? "الدعم والمساعدة" : "Support & Help"}</bdi>
            </span>
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
        >
          <bdi>
            {isRTL 
              ? "كيف يمكننا مساعدتك؟"
              : "How Can We Help You?"
            }
          </bdi>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl"
        >
          <bdi>
            {isRTL 
              ? "ابحث في قاعدة المعرفة لدينا للعثور على إجابات لأسئلتك حول كيفية استخدام بروميتات، أو استكشاف الميزات، أو حل المشكلات الشائعة."
              : "Search our knowledge base to find answers to your questions about how to use Promptaat, explore features, or resolve common issues."
            }
          </bdi>
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse"
        >
          <Button 
            onClick={scrollToFaqSearch}
            size="lg"
            className="min-w-[180px] bg-accent-purple hover:bg-accent-purple/90 text-white"
          >
            <span>{isRTL ? "ابحث في الأسئلة الشائعة" : "Search FAQs"}</span>
          </Button>
          
          <Button
            onClick={scrollToFaqSearch}
            variant="outline"
            size="lg"
            className="min-w-[180px] group"
          >
            <span>{isRTL ? "تصفح الموضوعات" : "Browse Topics"}</span>
            <ChevronDown className={`ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4 transition-transform group-hover:translate-y-1`} />
          </Button>
        </motion.div>
        
        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div 
            onClick={scrollToFaqSearch}
            className="flex flex-col items-center cursor-pointer text-gray-500 hover:text-accent-purple transition-colors"
          >
            <span className="text-xs mb-2 hidden sm:block">
              <bdi>{isRTL ? "اسحب للأسفل" : "Scroll Down"}</bdi>
            </span>
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center p-1">
              <motion.div 
                animate={{ 
                  y: [0, 8, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="w-1.5 h-1.5 bg-accent-purple rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
