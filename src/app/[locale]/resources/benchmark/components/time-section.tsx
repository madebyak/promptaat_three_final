'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Dynamically import the chart to avoid SSR issues
const TimeChart = dynamic(
  () => import('./time-chart'),
  { ssr: false }
)

interface TimeSectionProps {
  isRTL?: boolean
}

export function TimeSection({ isRTL = false }: TimeSectionProps) {
  // Create refs for scroll-triggered animations
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
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
      
      <div className="container mx-auto px-4">
        <motion.div 
          variants={titleVariants}
          className={cn(
            "flex flex-col mb-8",
            isRTL ? "items-end text-right" : "items-start text-left"
          )}
        >
          <h2 className="text-3xl font-bold text-dark-dark-grey dark:text-white-pure mb-2">
            {isRTL ? 'كفاءة الوقت' : 'Time Efficiency'}
          </h2>
          <p className="text-light-hh-grey dark:text-light-grey max-w-3xl">
            {isRTL 
              ? 'تحليل لمتوسط الوقت المستغرق لإكمال البرومبتات المعقدة، حيث تشير القيم الأقل إلى أداء أفضل.'
              : 'Analysis of average time taken to complete complex prompts, where lower values indicate better performance.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            variants={chartContainerVariants}
            initial="hidden"
            animate={sectionInView ? "visible" : "hidden"}
            className="md:col-span-2"
          >
            <Card className="bg-light-grey-light/30 dark:bg-dark/30 backdrop-blur-sm border border-light-high-grey/20 dark:border-high-grey/20 h-full">
              <CardContent className="p-5">
                <h3 className={cn(
                  "text-lg font-semibold text-dark-dark-grey dark:text-white-pure mb-4",
                  isRTL ? "text-right" : "text-left"
                )}>
                  {isRTL ? 'تحليل الوقت' : 'Time Analysis'}
                </h3>
                <TimeChart isRTL={isRTL} />
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
                    <h3 className="text-lg font-semibold text-dark-dark-grey dark:text-white-pure mb-3">
                      {isRTL ? 'مقارنة الوقت' : 'Time Comparison'}
                    </h3>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-light-hh-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات أساسية' : 'Basic Prompts'}
                        </span>
                        <span className="text-dark-dark-grey dark:text-white-pure font-medium text-sm">1m 40s</span>
                      </div>
                      <div className="w-full bg-light-high-grey/20 dark:bg-high-grey/20 rounded-full h-2">
                        <motion.div 
                          custom={100}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-blue-400 dark:bg-blue-400 h-2 rounded-full"
                        ></motion.div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-light-hh-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات متقدمة' : 'Pro Prompts'}
                        </span>
                        <span className="text-dark-dark-grey dark:text-white-pure font-medium text-sm">1m 23s</span>
                      </div>
                      <div className="w-full bg-light-high-grey/20 dark:bg-high-grey/20 rounded-full h-2 mb-2">
                        <motion.div 
                          custom={83}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-blue-600 dark:bg-blue-600 h-2 rounded-full"
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
                    <h3 className="text-lg font-semibold text-dark-dark-grey dark:text-white-pure mb-3">
                      {isRTL ? 'عوامل تحسين الوقت' : 'Time Improvement Factors'}
                    </h3>
                    <p className="text-light-hh-grey dark:text-light-grey text-sm mb-4">
                      {isRTL 
                        ? 'العوامل الرئيسية التي تساهم في تحسين كفاءة الوقت:'
                        : 'Key factors contributing to time efficiency improvement:'}
                    </p>
                    <div className={cn(
                      "grid grid-cols-1 gap-2",
                      isRTL ? "text-right" : "text-left"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-500"></div>
                        <span className="text-dark-dark-grey/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تحسين بنية البرومبتات' : 'Improved prompt structure'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-500"></div>
                        <span className="text-dark-dark-grey/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تقليل التعليمات غير الضرورية' : 'Reduced unnecessary instructions'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-500"></div>
                        <span className="text-dark-dark-grey/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تحسينات في معالجة اللغة' : 'Language processing improvements'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
