'use client';

import React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import AccuracyChart from './accuracy-chart'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface AccuracySectionProps {
  isRTL?: boolean
}

export default function AccuracySection({ isRTL = false }: AccuracySectionProps) {
  // Translations
  const title = isRTL ? 'الدقة' : 'Accuracy'
  const description = isRTL 
    ? 'نقيس الدقة من خلال مقارنة نتائج البرومبتات المخصصة لدينا مع البرومبتات العامة. تُظهر البيانات أن برومبتات المتخصصة تنتج نتائج أكثر دقة بنسبة 92٪ مقارنة بالبرومبتات العامة غير المخصصة، مما يوفر للمستخدمين مخرجات أكثر موثوقية وملاءمة لاحتياجاتهم المحددة.'
    : 'We measure accuracy by comparing the results of our specialized prompts against generic prompts. The data shows that our industry-specific prompts produce 92% more accurate results compared to generic, non-specialized prompts, providing users with more reliable and relevant outputs for their specific needs.'
  
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Fixed: Removed unused chartInView variable
  const [chartRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [cardsRef, cardsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2
      }
    }
  };

  const chartContainerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: isRTL ? -30 : 30 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.4 + (i * 0.2)
      }
    })
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (percent: number) => ({ 
      width: `${percent}%`,
      transition: { 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.8
      }
    })
  };

  return (
    <motion.section 
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={sectionInView ? "visible" : "hidden"}
      className="py-16 relative"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-light-white/50 dark:from-black-main/50 via-light-grey-light/10 dark:via-dark/10 to-light-white/50 dark:to-black-main/50 opacity-50"></div>
      
      <Container>
        <motion.div 
          variants={titleVariants}
          className={cn("flex flex-col gap-4", isRTL && "items-end text-right")}
        >
          <h2 className="text-3xl font-bold text-dark-dark-grey dark:text-white-pure">{title}</h2>
          <p className="text-light-hh-grey dark:text-light-grey max-w-3xl mb-8">{description}</p>
          
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <motion.div 
              ref={chartRef}
              variants={chartContainerVariants}
              animate={inView ? "visible" : "hidden"}
              initial="hidden"
              className="lg:col-span-2 bg-light-grey-light/50 dark:bg-dark/50 rounded-xl border border-light-high-grey/30 dark:border-high-grey/30 backdrop-blur-sm p-6"
            >
              <AccuracyChart isRTL={isRTL} />
            </motion.div>
            
            {/* Comparison */}
            <div ref={cardsRef} className="flex flex-col gap-6">
              {/* Accuracy Comparison Card */}
              <motion.div
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate={cardsInView ? "visible" : "hidden"}
              >
                <Card className="bg-light-grey-light/50 dark:bg-dark/50 border-light-high-grey/30 dark:border-high-grey/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className={cn("text-xl font-semibold text-dark-dark-grey dark:text-white-pure mb-4", isRTL && "text-right")}>
                      {isRTL ? 'مقارنة الدقة' : 'Accuracy Comparison'}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Basic Prompts */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-light-hh-grey dark:text-light-grey">{isRTL ? 'برومبتات عامة' : 'Generic Prompts'}</span>
                          <span className="text-dark-grey dark:text-mid-grey font-semibold">84%</span>
                        </div>
                        <div className="w-full bg-light-white/50 dark:bg-black-main/50 rounded-full h-2">
                          <motion.div 
                            custom={84}
                            variants={progressVariants}
                            initial="hidden"
                            animate={cardsInView ? "visible" : "hidden"}
                            className="bg-dark-grey dark:bg-mid-grey h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                      
                      {/* Pro Prompts */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-light-hh-grey dark:text-light-grey">{isRTL ? 'برومبتات متخصصة' : 'Specialized Prompts'}</span>
                        <span className="text-accent-purple dark:text-accent-purple font-semibold">92%</span>
                        </div>
                        <div className="w-full bg-light-white/50 dark:bg-black-main/50 rounded-full h-2">
                          <motion.div 
                            custom={92}
                            variants={progressVariants}
                            initial="hidden"
                            animate={cardsInView ? "visible" : "hidden"}
                            className="bg-accent-purple dark:bg-accent-purple h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Accuracy Improvements Card */}
              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate={cardsInView ? "visible" : "hidden"}
              >
                <Card className="bg-light-grey-light/50 dark:bg-dark/50 border-light-high-grey/30 dark:border-high-grey/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className={cn("text-xl font-semibold text-dark-dark-grey dark:text-white-pure mb-4", isRTL && "text-right")}>
                      {isRTL ? 'تحسينات الدقة' : 'Accuracy Improvements'}
                    </h3>
                    
                    <ul className={cn("list-disc list-inside space-y-2 text-light-hh-grey dark:text-light-grey", isRTL && "text-right")}>
                      <li>{isRTL ? 'تخصيص حسب القطاع الصناعي' : 'Industry-specific customization'}</li>
                      <li>{isRTL ? 'تحسين هيكل البرومبتات' : 'Enhanced prompt structure'}</li>
                      <li>{isRTL ? 'تحليل البيانات المستمر' : 'Continuous data analysis'}</li>
                      <li>{isRTL ? 'التعلم من تفاعلات المستخدمين' : 'Learning from user interactions'}</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>
    </motion.section>
  )
}
