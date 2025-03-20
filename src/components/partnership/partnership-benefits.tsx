'use client'

import { Users2Icon, CodeIcon, DollarSignIcon, LayoutIcon } from 'lucide-react'

interface PartnershipBenefitsProps {
  locale: string
}

export default function PartnershipBenefits({ locale }: PartnershipBenefitsProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {isRTL ? "فوائد الشراكة" : "Partnership Benefits"}
          </h2>
          
          <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {isRTL 
              ? "الشراكة مع بروميتات تفتح عالمًا من الفرص المتبادلة والفوائد الاستراتيجية."
              : "Partnering with Promptaat opens a world of mutual opportunities and strategic benefits."
            }
          </p>
        </div>
        
        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Expand Your Reach */}
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <Users2Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isRTL ? "توسيع نطاق وصولك" : "Expand Your Reach"}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "الوصول إلى قاعدة مستخدمي بروميتات المتنامية"
                      : "Access to Promptaat's growing user base"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "فرص التسويق المشترك"
                      : "Co-marketing opportunities"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "تسليط الضوء على الشركاء المميزين"
                      : "Featured partner spotlight"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Technical Integration */}
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
              <CodeIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isRTL ? "التكامل التقني" : "Technical Integration"}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "الوصول إلى واجهة برمجة التطبيقات للتكامل السلس"
                      : "API access for seamless integration"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "تطوير ميزات مخصصة"
                      : "Custom features development"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "دعم فني ذو أولوية"
                      : "Priority technical support"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Revenue Opportunities */}
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <DollarSignIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isRTL ? "فرص الإيرادات" : "Revenue Opportunities"}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "هيكل العمولات للإحالات"
                      : "Commission structure for referrals"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "مشاركة الإيرادات لشركاء المحتوى"
                      : "Revenue share for content partners"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "صفقات حزم الاشتراك"
                      : "Subscription package deals"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Brand Association */}
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 rtl:space-x-reverse">
            <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
              <LayoutIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isRTL ? "ارتباط العلامة التجارية" : "Brand Association"}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "مواد تحمل العلامتين التجاريتين"
                      : "Co-branded materials"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "علاقات عامة مشتركة"
                      : "Shared public relations"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 mr-2 rtl:ml-2 text-accent-purple">•</span>
                  <span>
                    {isRTL
                      ? "تواجد مشترك في الصناعة"
                      : "Joint industry presence"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
