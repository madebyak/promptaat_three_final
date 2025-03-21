'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Dynamically import the chart to avoid SSR issues
const CreativityChart = dynamic(
  () => import('./creativity-chart'),
  { ssr: false }
)

interface CreativitySectionProps {
  isRTL?: boolean
}

export function CreativitySection({ isRTL = false }: CreativitySectionProps) {
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
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-black-main/50 via-light-grey-light/10 dark:via-dark/10 to-white/50 dark:to-black-main/50 opacity-50"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          variants={titleVariants}
          className={cn(
            "flex flex-col mb-8",
            isRTL ? "items-end text-right" : "items-start text-left"
          )}
        >
          <h2 className="text-3xl font-bold text-black-main dark:text-white-pure mb-2">
            {isRTL ? 'الإبداع' : 'Creativity'}
          </h2>
          <p className="text-mid-grey dark:text-light-grey max-w-3xl">
            {isRTL 
              ? 'تحليل لمستويات الإبداع في المخرجات، بناءً على تقييمات المستخدمين والمقيمين المتخصصين.'
              : 'Analysis of creativity levels in outputs, based on user ratings and expert evaluators.'}
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
                  "text-lg font-semibold text-black-main dark:text-white-pure mb-4",
                  isRTL ? "text-right" : "text-left"
                )}>
                  {isRTL ? 'تحليل الإبداع' : 'Creativity Analysis'}
                </h3>
                <CreativityChart isRTL={isRTL} />
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
                      {isRTL ? 'مقارنة الإبداع' : 'Creativity Comparison'}
                    </h3>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-mid-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات أساسية' : 'Basic Prompts'}
                        </span>
                        <span className="text-black-main dark:text-white-pure font-medium text-sm">80%</span>
                      </div>
                      <div className="w-full bg-light-high-grey/20 dark:bg-high-grey/20 rounded-full h-2">
                        <motion.div 
                          custom={80}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-pink-400 dark:bg-pink-400 h-2 rounded-full"
                        ></motion.div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-mid-grey dark:text-light-grey text-sm">
                          {isRTL ? 'برومبتات متقدمة' : 'Pro Prompts'}
                        </span>
                        <span className="text-black-main dark:text-white-pure font-medium text-sm">85%</span>
                      </div>
                      <div className="w-full bg-light-high-grey/20 dark:bg-high-grey/20 rounded-full h-2 mb-2">
                        <motion.div 
                          custom={85}
                          variants={progressVariants}
                          initial="hidden"
                          animate={cardsInView ? "visible" : "hidden"}
                          className="bg-pink-600 dark:bg-pink-600 h-2 rounded-full"
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
                      {isRTL ? 'عوامل تحسين الإبداع' : 'Creativity Enhancement Factors'}
                    </h3>
                    <p className="text-mid-grey dark:text-light-grey text-sm mb-4">
                      {isRTL 
                        ? 'العوامل الرئيسية التي تساهم في تحسين الإبداع في المخرجات:'
                        : 'Key factors contributing to creativity enhancement in outputs:'}
                    </p>
                    <div className={cn(
                      "grid grid-cols-1 gap-2",
                      isRTL ? "text-right" : "text-left"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تقنيات تحفيز الإبداع' : 'Creative stimulation techniques'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'تنويع مصادر المعرفة' : 'Diversified knowledge sources'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-500"></div>
                        <span className="text-black-main/90 dark:text-white-pure/90 text-sm">
                          {isRTL ? 'برومبتات مخصصة للإبداع' : 'Creativity-focused prompts'}
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
