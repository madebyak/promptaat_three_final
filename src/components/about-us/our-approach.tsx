'use client'

import { MonitorIcon, SmartphoneIcon, LayoutIcon, Users2Icon } from 'lucide-react'

interface OurApproachProps {
  locale: string
}

export default function OurApproach({ locale }: OurApproachProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">      
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "نهجنا" : "Our Approach"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "نحن نجمع بين الخبرة التقنية والرؤية الإبداعية لبناء منتجات تجعل الذكاء الاصطناعي أكثر سهولة في الاستخدام وفعالية."
              : "We combine technical expertise and creative vision to build products that make AI more accessible and effective."
            }
          </p>
        </div>
        
        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Versatile experience */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <MonitorIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "تجربة متعددة الاستخدامات" : "Versatile Experience"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "نصمم واجهات سهلة الاستخدام تعمل بسلاسة عبر الأجهزة المكتبية والمتنقلة، مما يضمن تجربة متسقة بغض النظر عن الجهاز."
                  : "We design intuitive interfaces that work seamlessly across desktop and mobile, ensuring a consistent experience regardless of device."
                }
              </p>
            </div>
          </div>
          
          {/* Mobile-first design */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                  <SmartphoneIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "تصميم للجوال أولاً" : "Mobile-First Design"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "نتبنى نهج الجوال أولاً في تصميماتنا، مما يضمن أن تطبيقاتنا تعمل بشكل مثالي على الأجهزة المحمولة مع الحفاظ على وظائف سطح المكتب الكاملة."
                  : "We embrace a mobile-first approach to our designs, ensuring our applications work flawlessly on mobile devices while maintaining full desktop functionality."
                }
              </p>
            </div>
          </div>
          
          {/* Intuitive UI */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <LayoutIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "واجهة مستخدم بديهية" : "Intuitive UI"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "نصمم واجهات مستخدم بديهية تجعل التفاعل مع الذكاء الاصطناعي أمرًا طبيعيًا وخاليًا من الاحتكاك، مما يقلل من منحنى التعلم."
                  : "We design intuitive user interfaces that make interacting with AI feel natural and frictionless, reducing the learning curve."
                }
              </p>
            </div>
          </div>
          
          {/* User-centric */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <Users2Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "التركيز على المستخدم" : "User-Centric"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "نضع المستخدمين في قلب عملية التصميم لدينا، مع إجراء اختبارات مستخدم متكررة والاستماع بنشاط إلى التعليقات لتحسين منتجاتنا باستمرار."
                  : "We put users at the heart of our design process, conducting frequent user testing and actively listening to feedback to continuously improve our products."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
