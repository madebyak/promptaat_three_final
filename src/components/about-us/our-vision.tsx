'use client'

import { LightbulbIcon, BrainCircuitIcon, UsersIcon } from 'lucide-react'

interface OurVisionProps {
  locale: string
}

export default function OurVision({ locale }: OurVisionProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-light-grey-light dark:bg-black-main">
      {/* Content container */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left side - Text content */}
          <div className={`space-y-6 md:space-y-8 ${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {isRTL ? "رؤيتنا وفلسفتنا" : "Our Vision & Philosophy"}
            </h2>
            
            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              {isRTL 
                ? "نشترك في الفلسفة التي تضع المستخدم أولاً والتي تدعمها الشركات المبتكرة للنهج الواضح والأخلاقي والداعم لتطوير الذكاء الاصطناعي. من خلال مواءمة أنفسنا مع هذه المبادئ، أنشأنا مساحة حيث تلتقي الدقة التقنية مع الرؤية الإنسانية الحقيقية."
                : "We share the user-first philosophy championed by forward-thinking companies for clear, ethical, and supportive approach to AI development. By aligning ourselves with these principles, we've created a space where technical precision meets genuine human insight."
              }
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
              {isRTL 
                ? "محور عملنا هو الاعتقاد بأن الذكاء الاصطناعي يجب أن يتكيف معك، وليس العكس. تم تصميم كل موجه في مكتبتنا مع مراعاة تعقيدات العالم الحقيقي مثل المصطلحات الخاصة بالصناعة والعمق السياقي وسلوكيات الذكاء الاصطناعي المتطورة."
                : "Central to our work is the belief that AI should adapt to you, not the other way around. Every prompt in our library is designed with real-world complexities in mind like industry-specific terminology, contextual depth, and evolving AI behaviors."
              }
            </p>
          </div>
          
          {/* Right side - Feature cards */}
          <div className={`grid grid-cols-1 gap-6 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
            {/* Card 1 */}
            <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
              <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <LightbulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {isRTL ? "رؤية واضحة" : "Clear Vision"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isRTL 
                        ? "نحن نؤمن بأن الذكاء الاصطناعي يجب أن يكون أداة تمكين للإبداع البشري، وليس بديلاً عنه. هدفنا هو جعل تقنية الذكاء الاصطناعي أكثر سهولة في الاستخدام وأكثر فعالية للجميع."
                        : "We believe AI should be an enabler of human creativity, not a replacement for it. Our goal is to make AI technology more accessible and effective for everyone."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
              <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
                    <BrainCircuitIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {isRTL ? "ذكاء متقدم" : "Advanced Intelligence"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isRTL 
                        ? "نحن نطور تقنيات ذكاء اصطناعي متقدمة تفهم السياق وتتكيف مع احتياجاتك المحددة، مما يوفر تجربة أكثر طبيعية وفعالية."
                        : "We develop advanced AI technologies that understand context and adapt to your specific needs, providing a more natural and effective experience."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="relative group transform transition-all duration-300 hover:-translate-y-2">
              <div className="relative bg-white dark:bg-black-main border border-gray-200 dark:border-white/10 rounded-xl p-6 md:p-8 h-full">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                    <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {isRTL ? "تركيز على المستخدم" : "User-Centric"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isRTL 
                        ? "نضع المستخدمين في قلب كل ما نقوم به، مع التركيز على تصميم واجهات سهلة الاستخدام وتوفير تجارب سلسة عبر جميع منصاتنا."
                        : "We put users at the heart of everything we do, focusing on intuitive interfaces and seamless experiences across all our platforms."
                      }
                    </p>
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
