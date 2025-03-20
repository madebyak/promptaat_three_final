'use client'

import { ServerIcon, FileTextIcon, BriefcaseIcon, GraduationCapIcon } from 'lucide-react'

interface PartnershipTypesProps {
  locale: string
}

export default function PartnershipTypes({ locale }: PartnershipTypesProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section id="partnership-types" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "أنواع الشراكات" : "Partnership Types"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "نحن نقدم عدة أنواع من الشراكات لتلبية احتياجات مختلف المؤسسات والأفراد."
              : "We offer several types of partnerships to meet the needs of different organizations and individuals."
            }
          </p>
        </div>
        
        {/* Partnership types grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Technology Partners */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <ServerIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "شركاء التكنولوجيا" : "Technology Partners"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "لشركات الذكاء الاصطناعي ومزودي نماذج اللغة الكبيرة ومطوري الأدوات. دمج الخدمات، وتوسيع نطاق الوصول، وتعزيز القدرات."
                  : "For AI companies, LLM providers, and tool creators. Integrate services, expand reach, and enhance capabilities."
                }
              </p>
            </div>
          </div>
          
          {/* Content Partners */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                  <FileTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "شركاء المحتوى" : "Content Partners"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "لمهندسي الموجهات وخبراء الذكاء الاصطناعي ومنشئي المحتوى. المساهمة بموجهات متميزة وتحقيق الدخل من الخبرة."
                  : "For prompt engineers, AI experts, and content creators. Contribute premium prompts and monetize expertise."
                }
              </p>
            </div>
          </div>
          
          {/* Business Partnerships */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <BriefcaseIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "شراكات الأعمال" : "Business Partnerships"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "للمؤسسات التي تتطلع إلى استخدام بروميتات لفرقها. حلول مخصصة، وترخيص بالجملة، وتدريب."
                  : "For enterprises looking to utilize Promptaat for their teams. Custom solutions, bulk licensing, and training."
                }
              </p>
            </div>
          </div>
          
          {/* Educational Partners */}
          <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
            <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <GraduationCapIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {isRTL ? "شركاء التعليم" : "Educational Partners"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 flex-grow">
                {isRTL 
                  ? "للجامعات وبرامج التدريب والمعلمين. أسعار خاصة، ومواد تعليمية مشتركة، وتعاون بحثي."
                  : "For universities, training programs, and educators. Special pricing, co-branded materials, research collaboration."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
