'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HelpCircleIcon, MessageSquareIcon, ArrowRight } from 'lucide-react'

interface ContactCtaProps {
  locale: string
}

export default function ContactCta({ locale }: ContactCtaProps) {
  const isRTL = locale === 'ar'
  
  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-light-grey-light to-white dark:from-black-main dark:to-black-main">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Text content */}
            <div className={`p-8 md:p-12 ${isRTL ? 'md:order-2' : 'md:order-1'}`}>
              <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="inline-flex items-center justify-center p-3 bg-accent-purple/10 rounded-full">
                  <HelpCircleIcon className="h-6 w-6 text-accent-purple" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {isRTL ? "لم تجد إجابة لسؤالك؟" : "Couldn't Find Your Answer?"}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {isRTL 
                    ? "فريق الدعم لدينا جاهز لمساعدتك. أرسل لنا استفسارك وسنعود إليك في أقرب وقت ممكن."
                    : "Our support team is ready to help you. Send us your inquiry and we'll get back to you as soon as possible."
                  }
                </p>
                
                <div className="pt-2 space-y-3 sm:space-y-0 sm:space-x-4 sm:rtl:space-x-reverse sm:flex">
                  <Button 
                    asChild
                    className="w-full sm:w-auto bg-accent-purple hover:bg-accent-purple/90 text-white"
                  >
                    <Link href={`/${locale}/contact`}>
                      <MessageSquareIcon className={`h-4 w-4 ${isRTL ? 'ml-2 rtl:mr-0' : 'mr-2'}`} />
                      <span>{isRTL ? "تواصل معنا" : "Contact Us"}</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    <Link href={`/${locale}/resources/documentation`} className="group">
                      <span>{isRTL ? "استكشف الوثائق" : "Explore Documentation"}</span>
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rtl:rotate-180' : 'ml-2'} transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1`} />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Image/Design element */}
            <div className={`relative ${isRTL ? 'md:order-1' : 'md:order-2'} bg-accent-purple/10`}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-blue-500/20 dark:from-accent-purple/30 dark:to-blue-500/30">
                <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-30"></div>
              </div>
              
              <div className="relative h-full flex items-center justify-center p-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-xs"
                >
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="space-y-4">
                      <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-2 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-10 bg-accent-purple/20 dark:bg-accent-purple/30 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-accent-purple">
                          {isRTL ? "نحن هنا للمساعدة" : "We're Here to Help"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
