'use client';

import React from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface HeroProps {
  title: string
  description: string
  subtext: string
  isRTL?: boolean
}

export default function BenchmarkHero({ 
  title, 
  description, 
  subtext,
  isRTL = false
}: HeroProps) {
  // Animation variants for text elements with stronger slide-up effect
  const titleVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.5, 
        ease: [0.16, 1, 0.3, 1], // easeInOutQuint
        delay: 0.2
      }
    }
  };
  
  const descriptionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1], 
        delay: 1.0
      }
    }
  };
  
  const subtextVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.0, 
        ease: [0.16, 1, 0.3, 1], 
        delay: 1.6
      }
    }
  };

  // Parallax effect - applied after initial animation completes
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 500], [0, -150]);
  const descriptionY = useTransform(scrollY, [0, 500], [0, -100]);
  const subtextY = useTransform(scrollY, [0, 500], [0, -50]);

  // Intersection observer for triggering animations
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background with dots pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#6a7380_1px,transparent_1px)] dark:bg-[radial-gradient(#6a7380_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.15]"></div>
      </div>
      
      {/* Hero content */}
      <Container className={cn(
        "py-10 md:py-16 text-center",
        isRTL ? "rtl" : "ltr"
      )}>
        <div ref={ref} className="relative">
          <motion.div
            style={{ y: titleY }}
            className="relative"
          >
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter mb-6 
                        bg-clip-text text-transparent bg-gradient-to-r from-dark-dark-grey dark:from-white-pure to-light-hh-grey dark:to-light-grey-low"
              variants={titleVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {title}
            </motion.h1>
          </motion.div>
          
          <motion.div
            style={{ y: descriptionY }}
            className="relative"
          >
            <motion.p 
              className="text-2xl md:text-3xl font-bold text-dark-dark-grey dark:text-white-pure mb-4 max-w-4xl mx-auto"
              variants={descriptionVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {description}
            </motion.p>
          </motion.div>
          
          <motion.div
            style={{ y: subtextY }}
            className="relative"
          >
            <motion.p 
              className="text-xl text-light-hh-grey dark:text-light-grey max-w-4xl mx-auto"
              variants={subtextVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {subtext}
            </motion.p>
          </motion.div>
        </div>
        
        {/* Abstract data visualization elements */}
        <div className="mt-16 relative h-48 mx-auto max-w-4xl">
          <div className="grid grid-cols-6 gap-4 h-full relative">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative h-full flex items-end">
                <motion.div 
                  className={cn(
                    "w-full bg-gradient-to-t from-transparent to-light-hh-grey dark:to-light-grey rounded-t-md",
                    "opacity-70 hover:opacity-100 transition-all duration-500"
                  )}
                  style={{ 
                    height: `${Math.max(30, Math.min(90, 35 + Math.sin(i * 1.5) * 60))}%`,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 2.2 + i * 0.15, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* Floating data points */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => {
              const size = Math.max(3, Math.random() * 8);
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              const animationDuration = 3 + Math.random() * 4;
              
              return (
                <motion.div 
                  key={i}
                  className="absolute rounded-full bg-dark-dark-grey dark:bg-white-pure opacity-60"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4], 
                    scale: 1,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    opacity: {
                      duration: animationDuration,
                      repeat: Infinity,
                      repeatType: "reverse"
                    },
                    y: {
                      duration: animationDuration,
                      repeat: Infinity,
                      repeatType: "reverse"
                    },
                    scale: {
                      duration: 0.8,
                      delay: 2.8 + (i * 0.05)
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  )
}
