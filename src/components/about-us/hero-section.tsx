'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

interface HeroSectionProps {
  locale: string
}

export default function HeroSection({ locale }: HeroSectionProps) {
  // Remove unused 't' variable since we're using hardcoded translations for now
  const isRTL = locale === 'ar'
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  
  // Enhanced parallax effect on mouse move
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    // Reset positions when mouse leaves
    const resetPositions = () => {
      const appIcon = container.querySelector('.app-icon') as HTMLElement
      const dotsPattern = container.querySelector('.dots-pattern') as HTMLElement
      
      if (appIcon) {
        appIcon.style.transition = 'transform 0.5s ease-out'
        appIcon.style.transform = 'translate(0px, 0px)'
      }
      
      if (dotsPattern) {
        dotsPattern.style.transition = 'transform 0.5s ease-out'
        dotsPattern.style.transform = 'translate(0px, 0px)'
      }
      
      setIsHovering(false)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      setIsHovering(true)
      
      const { clientX, clientY } = e
      const { width, height, left, top } = container.getBoundingClientRect()
      
      // Check if mouse is within boundaries with some margin
      const isInBounds = 
        clientX >= left - 100 && 
        clientX <= left + width + 100 && 
        clientY >= top - 100 && 
        clientY <= top + height + 100
      
      if (!isInBounds) {
        resetPositions()
        return
      }
      
      const x = clientX - left
      const y = clientY - top
      
      // Exaggerated parallax effect with smoother movement
      const moveX = (x - width / 2) * 0.06
      const moveY = (y - height / 2) * 0.06
      
      // Apply parallax to app icon with smoother transition
      const appIcon = container.querySelector('.app-icon') as HTMLElement
      if (appIcon) {
        appIcon.style.transition = isHovering ? 'transform 0.2s ease-out' : 'transform 0.5s ease-out'
        appIcon.style.transform = `translate(${moveX * 1.5}px, ${moveY * 1.5}px)`
      }
      
      // Apply parallax to dots pattern (in opposite direction for depth)
      const dotsPattern = container.querySelector('.dots-pattern') as HTMLElement
      if (dotsPattern) {
        dotsPattern.style.transition = isHovering ? 'transform 0.2s ease-out' : 'transform 0.5s ease-out'
        dotsPattern.style.transform = `translate(${-moveX * 0.7}px, ${-moveY * 0.7}px)`
      }
    }
    
    const handleMouseLeave = () => {
      resetPositions()
    }
    
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [isHovering]) // Add isHovering as a dependency

  return (
    <section 
      ref={containerRef}
      className={`relative w-full flex flex-col items-center overflow-hidden py-16 md:py-24 bg-white dark:bg-black-main ${isRTL ? 'text-right' : 'text-left'}`}
    >
      {/* Background dots pattern with improved positioning and opacity */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-6xl mx-auto dots-pattern transition-transform duration-300 ease-out">
          <Image 
            src="/about-us-page/dots.svg" 
            alt=""
            width={1200}
            height={800}
            className={`object-contain ${theme === 'dark' ? 'opacity-40' : 'opacity-15'}`}
            aria-hidden="true"
            priority
          />
        </div>
      </div>
      
      {/* Content container with better spacing */}
      <div className={`relative z-10 flex flex-col ${isRTL ? 'items-end' : 'items-center'} justify-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isRTL ? 'text-right' : 'text-center'} space-y-8 md:space-y-10`}>
        {/* App icon - removed drop shadow */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 app-icon transition-transform duration-300 ease-out">
          <Image 
            src="/about-us-page/promptaat-app-icon.svg" 
            alt="Promptaat App Icon" 
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Headline with better typography */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          {isRTL 
            ? "إعادة تعريف كيفية تواصل الناس مع الآلات"
            : "Redefining How People Communicate with Machines"
          }
        </h1>
        
        {/* Introduction with better contrast and spacing */}
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          {isRTL 
            ? "في بروميتات، نحن مدفوعون برؤية تحويل كيفية تفاعل الناس مع الذكاء الاصطناعي بحيث يشعر بالقوة وسهولة الوصول."
            : "At Promptaat, we're driven by the vision of transforming how people engage with AI so it feels both powerful and accessible."
          }
        </p>
      </div>
    </section>
  )
}
