'use client'

import { MessageSquareIcon, FileTextIcon, CodeIcon, RocketIcon, RefreshCwIcon } from 'lucide-react'

interface PartnershipProcessProps {
  locale: string
}

export default function PartnershipProcess({ locale }: PartnershipProcessProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "عملية الشراكة" : "Partnership Process"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "نحن نتبع عملية منظمة لضمان تجربة شراكة سلسة وناجحة."
              : "We follow a structured process to ensure a smooth and successful partnership experience."
            }
          </p>
        </div>
        
        {/* Process timeline */}
        <div className={`relative ${isRTL ? "rtl" : "ltr"}`}>
          {/* Vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full hidden md:block"></div>
          
          {/* Timeline steps */}
          <div className="space-y-12 md:space-y-0 relative">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row md:items-center mb-12">
              <div className={`md:w-1/2 ${isRTL ? "md:order-2 md:pl-16 text-right" : "md:order-1 md:pr-16 text-left"}`}>
                <div className="md:max-w-sm md:ml-auto md:mr-0 rtl:md:ml-0 rtl:md:mr-auto">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-blue-600 dark:text-blue-400">1</span>
                    {isRTL ? "الاتصال الأولي والاكتشاف" : "Initial Contact & Discovery"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isRTL 
                      ? "نبدأ بفهم أهدافك واحتياجاتك الفريدة. هذا يتضمن مناقشة أولية لتحديد المجالات المحتملة للتعاون."
                      : "We begin by understanding your goals and unique needs. This involves an initial discussion to identify potential areas for collaboration."
                    }
                  </p>
                </div>
              </div>
              
              <div className={`hidden md:flex md:w-14 md:justify-center md:relative md:z-10 ${isRTL ? "md:order-1" : "md:order-2"}`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black-main border-4 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                  <MessageSquareIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className={`md:w-1/2 mt-4 md:mt-0 ${isRTL ? "md:order-1 md:pr-16 text-right" : "md:order-3 md:pl-16 text-left"}`}>
                <div className="md:max-w-sm md:mr-auto md:ml-0 rtl:md:mr-0 rtl:md:ml-auto">
                  {/* Placeholder for large screens */}
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row md:items-center mb-12">
              <div className={`md:w-1/2 ${isRTL ? "md:order-2 md:pl-16 text-right" : "md:order-3 md:pl-16 text-left"}`}>
                <div className="md:max-w-sm md:mr-auto md:ml-0 rtl:md:mr-0 rtl:md:ml-auto">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 md:flex md:items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-purple-600 dark:text-purple-400">2</span>
                    {isRTL ? "تعريف الشراكة والاتفاق" : "Partnership Definition & Agreement"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isRTL 
                      ? "نقوم بصياغة اتفاقية تحدد شروط الشراكة، بما في ذلك الأهداف والمسؤوليات والتوقعات لكلا الطرفين."
                      : "We draft an agreement outlining the partnership terms, including objectives, responsibilities, and expectations for both parties."
                    }
                  </p>
                </div>
              </div>
              
              <div className={`hidden md:flex md:w-14 md:justify-center md:relative md:z-10 ${isRTL ? "md:order-1" : "md:order-2"}`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black-main border-4 border-purple-600 dark:border-purple-400 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <div className={`md:w-1/2 mt-4 md:mt-0 ${isRTL ? "md:order-3 md:pr-16 text-right" : "md:order-1 md:pr-16 text-left"}`}>
                <div className="md:max-w-sm md:ml-auto md:mr-0 rtl:md:ml-0 rtl:md:mr-auto">
                  {/* Placeholder for large screens */}
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row md:items-center mb-12">
              <div className={`md:w-1/2 ${isRTL ? "md:order-2 md:pl-16 text-right" : "md:order-1 md:pr-16 text-left"}`}>
                <div className="md:max-w-sm md:ml-auto md:mr-0 rtl:md:ml-0 rtl:md:mr-auto">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-green-600 dark:text-green-400">3</span>
                    {isRTL ? "التكامل التقني (إذا كان ينطبق)" : "Technical Integration (if applicable)"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isRTL 
                      ? "يعمل فريقنا التقني معك لتسهيل أي تكامل مطلوب، ضمان الوظائف السلسة والأمان."
                      : "Our technical team works with you to facilitate any required integration, ensuring seamless functionality and security."
                    }
                  </p>
                </div>
              </div>
              
              <div className={`hidden md:flex md:w-14 md:justify-center md:relative md:z-10 ${isRTL ? "md:order-1" : "md:order-2"}`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black-main border-4 border-green-600 dark:border-green-400 flex items-center justify-center">
                  <CodeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className={`md:w-1/2 mt-4 md:mt-0 ${isRTL ? "md:order-1 md:pr-16 text-right" : "md:order-3 md:pl-16 text-left"}`}>
                <div className="md:max-w-sm md:mr-auto md:ml-0 rtl:md:mr-0 rtl:md:ml-auto">
                  {/* Placeholder for large screens */}
                </div>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col md:flex-row md:items-center mb-12">
              <div className={`md:w-1/2 ${isRTL ? "md:order-2 md:pl-16 text-right" : "md:order-3 md:pl-16 text-left"}`}>
                <div className="md:max-w-sm md:mr-auto md:ml-0 rtl:md:mr-0 rtl:md:ml-auto">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 md:flex md:items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-amber-600 dark:text-amber-400">4</span>
                    {isRTL ? "الإطلاق والترويج" : "Launch & Promotion"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isRTL 
                      ? "نعمل معًا لإطلاق الشراكة وتعزيز الوعي من خلال قنوات التسويق المشتركة والإعلانات الاستراتيجية."
                      : "We work together to launch the partnership and promote awareness through joint marketing channels and strategic announcements."
                    }
                  </p>
                </div>
              </div>
              
              <div className={`hidden md:flex md:w-14 md:justify-center md:relative md:z-10 ${isRTL ? "md:order-1" : "md:order-2"}`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black-main border-4 border-amber-600 dark:border-amber-400 flex items-center justify-center">
                  <RocketIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              <div className={`md:w-1/2 mt-4 md:mt-0 ${isRTL ? "md:order-3 md:pr-16 text-right" : "md:order-1 md:pr-16 text-left"}`}>
                <div className="md:max-w-sm md:ml-auto md:mr-0 rtl:md:ml-0 rtl:md:mr-auto">
                  {/* Placeholder for large screens */}
                </div>
              </div>
            </div>
            
            {/* Step 5 */}
            <div className="flex flex-col md:flex-row md:items-center">
              <div className={`md:w-1/2 ${isRTL ? "md:order-2 md:pl-16 text-right" : "md:order-1 md:pr-16 text-left"}`}>
                <div className="md:max-w-sm md:ml-auto md:mr-0 rtl:md:ml-0 rtl:md:mr-auto">
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="inline-block w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mr-3 rtl:ml-3 rtl:mr-0 text-blue-600 dark:text-blue-400">5</span>
                    {isRTL ? "التعاون المستمر والنمو" : "Ongoing Collaboration & Growth"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isRTL 
                      ? "نراجع أداء الشراكة بانتظام، ونعمل على تحسين العروض المشتركة، ونستكشف فرصًا جديدة للتعاون."
                      : "We regularly review partnership performance, work on improving joint offerings, and explore new opportunities for collaboration."
                    }
                  </p>
                </div>
              </div>
              
              <div className={`hidden md:flex md:w-14 md:justify-center md:relative md:z-10 ${isRTL ? "md:order-1" : "md:order-2"}`}>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black-main border-4 border-blue-600 dark:border-blue-400 flex items-center justify-center">
                  <RefreshCwIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className={`md:w-1/2 mt-4 md:mt-0 ${isRTL ? "md:order-1 md:pr-16 text-right" : "md:order-3 md:pl-16 text-left"}`}>
                <div className="md:max-w-sm md:mr-auto md:ml-0 rtl:md:mr-0 rtl:md:ml-auto">
                  {/* Placeholder for large screens */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
