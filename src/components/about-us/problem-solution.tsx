'use client'

import { AlertCircleIcon, CheckCircleIcon, HelpCircleIcon, MessageSquareIcon } from 'lucide-react'

interface ProblemSolutionProps {
  locale: string
}

export default function ProblemSolution({ locale }: ProblemSolutionProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "المشكلة والحل" : "The Problem & Solution"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "الذكاء الاصطناعي التوليدي يمتلك إمكانات هائلة، لكن استخدامه بفعالية يتطلب موجهات محددة ومصممة بعناية."
              : "Generative AI has immense potential, but using it effectively requires specific, carefully crafted prompts."
            }
          </p>
        </div>
        
        {/* Problem-Solution grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {/* Problem column */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3 rtl:space-x-reverse">
              <AlertCircleIcon className="w-6 h-6 text-red-500" />
              <span>{isRTL ? "المشكلة" : "The Problem"}</span>
            </h3>
            
            {/* Problem cards */}
            <div className="space-y-6">
              {/* Problem card 1 */}
              <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
                <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                      <HelpCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isRTL ? "صعوبة صياغة الموجهات" : "Prompt Crafting Difficulty"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isRTL 
                          ? "معظم المستخدمين يكافحون لصياغة موجهات فعالة تستخرج أفضل النتائج من نماذج الذكاء الاصطناعي."
                          : "Most users struggle to craft effective prompts that extract the best results from AI models."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Problem card 2 */}
              <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
                <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                      <MessageSquareIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isRTL ? "نتائج غير متسقة" : "Inconsistent Results"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isRTL 
                          ? "الموجهات غير المصقولة تؤدي إلى نتائج متفاوتة الجودة، مما يضيع الوقت ويسبب الإحباط."
                          : "Unrefined prompts lead to varying quality results, wasting time and causing frustration."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Solution column */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3 rtl:space-x-reverse">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              <span>{isRTL ? "الحل" : "The Solution"}</span>
            </h3>
            
            {/* Solution cards */}
            <div className="space-y-6">
              {/* Solution card 1 */}
              <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
                <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isRTL ? "مكتبة موجهات احترافية" : "Professional Prompt Library"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isRTL 
                          ? "مجموعة شاملة من الموجهات المصممة بعناية والمختبرة لضمان نتائج متسقة وعالية الجودة."
                          : "A comprehensive collection of carefully designed and tested prompts ensuring consistent, high-quality results."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Solution card 2 */}
              <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
                <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                      <MessageSquareIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isRTL ? "تخصيص سهل" : "Easy Customization"}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {isRTL 
                          ? "موجهات قابلة للتخصيص بسهولة لتناسب احتياجاتك المحددة، مع الحفاظ على الهيكل الأساسي الفعال."
                          : "Easily customizable prompts to fit your specific needs while maintaining the effective core structure."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
