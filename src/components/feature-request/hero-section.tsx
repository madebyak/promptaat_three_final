'use client'

import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { LightbulbIcon, MessageSquarePlusIcon } from 'lucide-react'

interface HeroSectionProps {
  locale: string
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const { theme } = useTheme()
  const isRTL = locale === 'ar'
  
  const translations = {
    title: isRTL ? 'طلب ميزة جديدة' : 'Request a Feature',
    subtitle: isRTL 
      ? 'ساعدنا في تحسين Promptaat من خلال اقتراح ميزات جديدة أو طلب موجهات محددة'
      : 'Help us improve Promptaat by suggesting new features or requesting specific prompts',
    featureRequest: isRTL ? 'اقتراح ميزة جديدة' : 'Suggest a New Feature',
    promptRequest: isRTL ? 'طلب موجه جديد' : 'Request a Specific Prompt',
    featureDesc: isRTL 
      ? 'هل لديك فكرة لتحسين تجربة المستخدم أو إضافة وظائف جديدة؟'
      : 'Have an idea to improve the user experience or add new functionality?',
    promptDesc: isRTL
      ? 'هل تحتاج إلى موجه محدد لمهمة معينة؟'
      : 'Need a specific prompt for a particular task?',
  }

  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white to-light-grey-light dark:from-black-main dark:to-dark">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center ${isRTL ? 'rtl' : 'ltr'}`}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-blue dark:from-accent-purple dark:to-accent-blue"
          >
            {translations.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12"
          >
            {translations.subtitle}
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-black-main border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-accent-purple mb-6">
                <LightbulbIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {translations.featureRequest}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {translations.featureDesc}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-black-main border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-accent-blue mb-6">
                <MessageSquarePlusIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {translations.promptRequest}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {translations.promptDesc}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
