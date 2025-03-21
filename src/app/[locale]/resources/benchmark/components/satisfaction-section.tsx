'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Dynamically import the chart to avoid SSR issues
const SatisfactionChart = dynamic(
  () => import('./satisfaction-chart'),
  { ssr: false }
)

interface SatisfactionSectionProps {
  isRTL?: boolean
}

export function SatisfactionSection({ isRTL = false }: SatisfactionSectionProps) {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [chartRef, chartInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const [cardsRef, cardsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1]
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
        delay: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3 + (i * 0.2)
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
        delay: 0.6
      }
    })
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isRTL ? -20 : 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.6 + (i * 0.1)
      }
    })
  };

  return (
    <section className="py-16" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <motion.div 
          variants={titleVariants}
          initial="hidden"
          animate={sectionInView ? "visible" : "hidden"}
          className={cn(
            "flex flex-col mb-8",
            isRTL ? "items-end text-right" : "items-start text-left"
          )}
        >
          <h2 className="text-3xl font-bold text-black-main dark:text-white-pure mb-2">
            {isRTL ? 'رضا المستخدم' : 'User Satisfaction'}
          </h2>
          <p className="text-mid-grey dark:text-light-grey max-w-3xl">
            {isRTL 
              ? 'تحليل لمستويات رضا المستخدمين عن نتائج البرومبتات، بناءً على استطلاعات الرأي والتعليقات.'
              : 'Analysis of user satisfaction levels with prompt results, based on surveys and feedback.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            ref={chartRef}
            variants={chartContainerVariants}
            initial="hidden"
            animate={chartInView ? "visible" : "hidden"}
            className="md:col-span-2"
          >
            <Card className="bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 h-full">
              <CardContent className="p-5">
                <h3 className={cn(
                  "text-lg font-semibold text-black-main dark:text-white-pure mb-4",
                  isRTL ? "text-right" : "text-left"
                )}>
                  {isRTL ? 'تحليل الرضا' : 'Satisfaction Analysis'}
                </h3>
                <SatisfactionChart isRTL={isRTL} />
              </CardContent>
            </Card>
          </motion.div>

          <div ref={cardsRef} className="md:col-span-1">
            <div className="grid grid-cols-1 gap-6 h-full">
              <motion.div
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate={cardsInView ? "visible" : "hidden"}
              >
                <Card className="bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 flex-1">
                  <CardContent className={cn(
                    "p-5 flex flex-col",
                    isRTL ? "text-right" : "text-left"
                  )}>
                    <h3 className="text-lg font-semibold text-black-main dark:text-white-pure mb-3">
                      {isRTL ? 'مقارنة الرضا' : 'Satisfaction Comparison'}
                    </h3>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-mid-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات أساسية' : 'Basic Prompts'}
                        </span>
                        <span className="text-black-main dark:text-white-pure font-medium text-sm">85%</span>
                      </div>
                      <div className="w-full bg-high-grey/20 dark:bg-high-grey/20 rounded-full h-2">
                        <motion.div 
                          custom={85}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-green-400 dark:bg-green-400 h-2 rounded-full"
                        ></motion.div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-mid-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات متقدمة' : 'Pro Prompts'}
                        </span>
                        <span className="text-black-main dark:text-white-pure font-medium text-sm">92%</span>
                      </div>
                      <div className="w-full bg-high-grey/20 dark:bg-high-grey/20 rounded-full h-2 mb-2">
                        <motion.div 
                          custom={92}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-green-600 dark:bg-green-600 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate={cardsInView ? "visible" : "hidden"}
              >
                <Card className="bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 flex-1">
                  <CardContent className={cn(
                    "p-5 flex flex-col",
                    isRTL ? "text-right" : "text-left"
                  )}>
                    <h3 className="text-lg font-semibold text-black-main dark:text-white-pure mb-3">
                      {isRTL ? 'عوامل تحسين الرضا' : 'Satisfaction Improvement Factors'}
                    </h3>
                    <p className="text-mid-grey dark:text-light-grey text-sm mb-4">
                      {isRTL 
                        ? 'العوامل الرئيسية التي تساهم في تحسين رضا المستخدم:'
                        : 'Key factors contributing to user satisfaction improvement:'}
                    </p>
                    <div className={cn(
                      "grid grid-cols-1 gap-2",
                      isRTL ? "text-right" : "text-left"
                    )}>
                      <motion.div 
                        custom={0}
                        variants={itemVariants}
                        initial="hidden"
                        animate={cardsInView ? "visible" : "hidden"}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'دقة أعلى في النتائج' : 'Higher accuracy in results'}
                        </span>
                      </motion.div>
                      <motion.div 
                        custom={1}
                        variants={itemVariants}
                        initial="hidden"
                        animate={cardsInView ? "visible" : "hidden"}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تحسين واجهة المستخدم' : 'Improved user interface'}
                        </span>
                      </motion.div>
                      <motion.div 
                        custom={2}
                        variants={itemVariants}
                        initial="hidden"
                        animate={cardsInView ? "visible" : "hidden"}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'استجابة أسرع للاستفسارات' : 'Faster response to queries'}
                        </span>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
