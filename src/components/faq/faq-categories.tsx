'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Layers3Icon, 
  KeyIcon, 
  SettingsIcon, 
  CreditCardIcon, 
  UsersIcon, 
  ShieldIcon 
} from 'lucide-react'

interface FaqCategoriesProps {
  locale: string
}

// Define category types and their corresponding icons
type CategoryKey = 'general' | 'account' | 'features' | 'pricing' | 'privacy' | 'technical'

interface Category {
  key: CategoryKey
  labelEn: string
  labelAr: string
  icon: React.ReactNode
  colorClass: string
}

export default function FaqCategories({ locale }: FaqCategoriesProps) {
  const isRTL = locale === 'ar'
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('general')

  // Category definitions with icons and colors
  const categories: Category[] = [
    {
      key: 'general',
      labelEn: 'General',
      labelAr: 'عام',
      icon: <Layers3Icon className="w-6 h-6" />,
      colorClass: 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
    },
    {
      key: 'account',
      labelEn: 'Account',
      labelAr: 'الحساب',
      icon: <KeyIcon className="w-6 h-6" />,
      colorClass: 'text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20'
    },
    {
      key: 'features',
      labelEn: 'Features',
      labelAr: 'الميزات',
      icon: <SettingsIcon className="w-6 h-6" />,
      colorClass: 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
    },
    {
      key: 'pricing',
      labelEn: 'Pricing',
      labelAr: 'التسعير',
      icon: <CreditCardIcon className="w-6 h-6" />,
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20'
    },
    {
      key: 'privacy',
      labelEn: 'Privacy',
      labelAr: 'الخصوصية',
      icon: <ShieldIcon className="w-6 h-6" />,
      colorClass: 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
    },
    {
      key: 'technical',
      labelEn: 'Technical',
      labelAr: 'تقني',
      icon: <UsersIcon className="w-6 h-6" />,
      colorClass: 'text-teal-500 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/20'
    },
  ]

  const handleCategoryClick = (key: CategoryKey) => {
    setActiveCategory(key)
    
    // Scroll to the corresponding FAQ section
    const faqSection = document.getElementById(`faq-${key}`)
    if (faqSection) {
      // Add a slight offset to account for any sticky headers
      const yOffset = -100
      const y = faqSection.getBoundingClientRect().top + window.scrollY + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black-main">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "استكشف حسب الفئة" : "Explore by Category"}
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {isRTL 
              ? "اختر إحدى الفئات أدناه للعثور على إجابات لأسئلتك بسرعة"
              : "Select a category below to quickly find answers to your questions"
            }
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category) => (
            <motion.button
              key={category.key}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category.key)}
              className={`flex flex-col items-center p-4 rounded-xl border ${
                activeCategory === category.key
                  ? 'border-accent-purple/50 dark:border-accent-purple/70 shadow-md bg-accent-purple/5'
                  : 'border-gray-200 dark:border-gray-800 hover:shadow-md'
              } transition-all duration-200`}
            >
              <div className={`w-12 h-12 rounded-full ${category.colorClass} flex items-center justify-center mb-3`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isRTL ? category.labelAr : category.labelEn}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
