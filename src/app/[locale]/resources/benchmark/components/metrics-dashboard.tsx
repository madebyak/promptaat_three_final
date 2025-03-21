'use client';

import React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Icons for metrics
import { BarChart3, Clock, Lightbulb, Building, CheckCircle, Smile } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  isRTL?: boolean
  index: number
}

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  isRTL = false,
  index
}: MetricCardProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1 * index
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.1 * index + 0.3
      }
    }
  };

  return (
    <motion.div 
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn(
        "bg-light-grey-light/50 dark:bg-dark/50 backdrop-blur-sm border border-light-high-grey/30 dark:border-high-grey/30 rounded-xl p-6",
        "transition-all duration-300 hover:border-light-hh-grey/60 dark:hover:border-high-grey/60 hover:shadow-lg hover:shadow-black-main/20 dark:hover:shadow-black-main/20",
        "flex flex-col gap-4 h-full"
      )}
    >
      <div className={cn(
        "flex items-center gap-3",
        isRTL ? "flex-row-reverse text-right" : "flex-row text-left"
      )}>
        <div className="p-2 rounded-lg bg-light-high-grey/30 dark:bg-high-grey/30 text-dark-dark-grey dark:text-white-pure">
          {icon}
        </div>
        <h3 className="font-semibold text-dark-dark-grey dark:text-white-pure">{title}</h3>
      </div>
      
      <div className={cn(
        "flex flex-col",
        isRTL ? "items-end text-right" : "items-start text-left"
      )}>
        <motion.div 
          variants={valueVariants}
          className="text-4xl font-bold text-dark-dark-grey dark:text-white-pure"
        >
          {value}
        </motion.div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm mt-1",
            trend.positive ? "text-accent-green dark:text-accent-green" : "text-accent-red dark:text-accent-red",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            <span>{trend.value}</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              className={trend.positive ? "rotate-0" : "rotate-180"}
            >
              <path d="M8 4L12 8L10.6 9.4L8 6.8L5.4 9.4L4 8L8 4Z" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
      
      <p className={cn(
        "text-light-hh-grey dark:text-light-grey text-sm mt-auto",
        isRTL ? "text-right" : "text-left"
      )}>
        {description}
      </p>
    </motion.div>
  )
}

interface MetricsDashboardProps {
  metrics: {
    industrySpecific: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
    accuracy: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
    quality: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
    timeEfficiency: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
    satisfaction: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
    creativity: {
      title: string
      value: string
      description: string
      trend?: { value: string; positive: boolean }
    }
  }
  isRTL?: boolean
}

export default function MetricsDashboard({ metrics, isRTL = false }: MetricsDashboardProps) {
  const {
    industrySpecific,
    accuracy,
    quality,
    timeEfficiency,
    satisfaction,
    creativity
  } = metrics
  
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

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
  
  return (
    <motion.section 
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={sectionInView ? "visible" : "hidden"}
      className="py-16 relative"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-light-white dark:from-black-main via-light-grey-light/20 dark:via-dark/20 to-light-white dark:to-black-main opacity-50"></div>
      
      <Container>
        <motion.div 
          variants={titleVariants}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-dark-dark-grey dark:text-white-pure mb-4">
            {isRTL ? 'مقاييس الأداء الرئيسية' : 'Key Performance Metrics'}
          </h2>
          <p className="text-light-hh-grey dark:text-light-grey max-w-3xl mx-auto">
            {isRTL 
              ? 'تعرف على كيفية أداء برومتات عبر المقاييس الرئيسية التي تهم المستخدمين والصناعة.'
              : 'Discover how Promptaat performs across key metrics that matter to users and the industry.'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title={industrySpecific.title}
            value={industrySpecific.value}
            description={industrySpecific.description}
            trend={industrySpecific.trend}
            icon={<Building size={20} />}
            isRTL={isRTL}
            index={0}
          />
          
          <MetricCard
            title={accuracy.title}
            value={accuracy.value}
            description={accuracy.description}
            trend={accuracy.trend}
            icon={<CheckCircle size={20} />}
            isRTL={isRTL}
            index={1}
          />
          
          <MetricCard
            title={quality.title}
            value={quality.value}
            description={quality.description}
            trend={quality.trend}
            icon={<BarChart3 size={20} />}
            isRTL={isRTL}
            index={2}
          />
          
          <MetricCard
            title={timeEfficiency.title}
            value={timeEfficiency.value}
            description={timeEfficiency.description}
            trend={timeEfficiency.trend}
            icon={<Clock size={20} />}
            isRTL={isRTL}
            index={3}
          />
          
          <MetricCard
            title={satisfaction.title}
            value={satisfaction.value}
            description={satisfaction.description}
            trend={satisfaction.trend}
            icon={<Smile size={20} />}
            isRTL={isRTL}
            index={4}
          />
          
          <MetricCard
            title={creativity.title}
            value={creativity.value}
            description={creativity.description}
            trend={creativity.trend}
            icon={<Lightbulb size={20} />}
            isRTL={isRTL}
            index={5}
          />
        </div>
      </Container>
    </motion.section>
  )
}
