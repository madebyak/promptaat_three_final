'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Add custom easing function for animations
import '@/styles/animations.css'

interface BannerProps {
  locale?: string
  className?: string
}

interface BannerContent {
  headline: string
  subheading: string
  image: string
}

const content: Record<string, BannerContent[]> = {
  en: [
    {
      headline: "Elevate Your AI Conversations",
      subheading: "Discover and share powerful prompts that unlock the full potential of AI tools",
      image: "/Banner_img_01.jpg"
    },
    {
      headline: "Find the Perfect Prompt",
      subheading: "Browse our curated collection of high-quality prompts for various AI tools",
      image: "/Banner_img_02.jpg"
    },
    {
      headline: "Share Your Expertise",
      subheading: "Contribute your own prompts and help others achieve better results with AI",
      image: "/Banner_img_03.jpg"
    }
  ],
  ar: [
    {
      headline: "ارتقِ بمحادثاتك مع الذكاء الاصطناعي",
      subheading: "اكتشف وشارك أقوى الإرشادات التي تطلق العنان لإمكانات أدوات الذكاء الاصطناعي",
      image: "/Banner_img_01.jpg"
    },
    {
      headline: "ابحث عن الإرشاد المثالي",
      subheading: "تصفح مجموعتنا المنسقة من الإرشادات عالية الجودة لمختلف أدوات الذكاء الاصطناعي",
      image: "/Banner_img_02.jpg"
    },
    {
      headline: "شارك خبرتك",
      subheading: "ساهم بإرشاداتك الخاصة وساعد الآخرين على تحقيق نتائج أفضل مع الذكاء الاصطناعي",
      image: "/Banner_img_03.jpg"
    }
  ]
}

// Memoize the Banner component to prevent unnecessary re-renders
export const Banner = memo(function Banner({ locale = 'en', className }: BannerProps) {
  const isRTL = locale === 'ar'
  const bannerItems = content[locale] || content.en
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { headline, subheading, image } = bannerItems[currentIndex]

  // Handle smooth transitions - wrapped in useCallback to avoid dependency issues
  const handleTransition = useCallback((indexFn: (prev: number) => number) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(indexFn)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 100) // Small delay after changing the index to allow new content to start animating in
    }, 500) // Time for current content to fade out
  }, [isTransitioning])
  
  // Auto-rotate banner items every 15 seconds (increased to reduce resource usage)
  useEffect(() => {
    // Don't start auto-rotation immediately to prioritize initial render performance
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        handleTransition((prev) => (prev + 1) % bannerItems.length)
      }, 15000)
      
      // Clean up interval when component unmounts
      return () => clearInterval(interval)
    }, 5000) // 5 second initial delay
    
    return () => clearTimeout(initialDelay)
  }, [bannerItems.length, handleTransition])

  const handlePrevious = () => {
    handleTransition(prev => (prev - 1 + bannerItems.length) % bannerItems.length)
  }

  const handleNext = () => {
    handleTransition(prev => (prev + 1) % bannerItems.length)
  }

  return (
    <div className={cn(
      "relative h-60 w-full rounded-lg overflow-hidden",
      className
    )}>
      {/* Background Image with optimized loading */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 ease-in-out-circ"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        <Image
          src={image}
          alt="Banner Background"
          fill
          priority
          quality={80}
          fetchPriority="high"
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-cover object-center"
          onLoad={(e) => {
            // Add the 'loaded' class to improve perceived performance
            if (e.target) {
              (e.target as HTMLImageElement).classList.add('loaded')
            }
          }}
        />
      </div>

      {/* Dark Overlay - Reduced opacity */}
      <div className="absolute inset-0 bg-black-main/20" />

      {/* Content - Centered with animations */}
      <div className="relative h-full flex items-center justify-center p-6">
        <div className={cn(
          "max-w-2xl text-center w-full px-4",
          isRTL ? "rtl" : "ltr"
        )}>
          <h1 
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold text-white-pure mb-4 transition-opacity duration-200 ease-in-out-circ mx-auto",
              isRTL ? "font-ibm-plex-sans-arabic" : "font-ibm-plex-sans",
              isTransitioning ? "opacity-0" : "opacity-100",
              "max-w-3xl" // Limit width to prevent line breaks
            )}
            style={{
              lineHeight: isRTL ? '1.4' : '1.2', // Adjust line height for Arabic
              direction: isRTL ? 'rtl' : 'ltr'
            }}
          >
            {headline}
          </h1>
          <p 
            className={cn(
              "text-base md:text-lg text-white-pure/90 transition-opacity duration-200 ease-in-out-circ mx-auto",
              isRTL ? "font-ibm-plex-sans-arabic" : "font-ibm-plex-sans",
              isTransitioning ? "opacity-0" : "opacity-100",
              "max-w-2xl" // Limit width to prevent line breaks
            )}
            style={{
              lineHeight: isRTL ? '1.6' : '1.5', // Adjust line height for Arabic
              direction: isRTL ? 'rtl' : 'ltr'
            }}
          >
            {subheading}
          </p>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className={cn(
        "absolute bottom-4 w-full flex justify-center gap-2 z-10",
        isRTL && "flex-row-reverse"
      )}>
        {bannerItems.map((_, index) => (
          <button
            key={index}
            onClick={() => handleTransition(() => index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300 ease-in-out-circ",
              index === currentIndex ? "bg-white-pure w-6" : "bg-white-pure/50 hover:bg-white-pure/80"
            )}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isTransitioning}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 left-4 bg-black-main/30 hover:bg-black-main/50 p-2 rounded-full text-white-pure transition-colors duration-200 ease-in-out-circ",
          isRTL && "left-auto right-4"
        )}
        aria-label="Previous slide"
        disabled={isTransitioning}
      >
        {isRTL ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>
      <button
        onClick={handleNext}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 right-4 bg-black-main/30 hover:bg-black-main/50 p-2 rounded-full text-white-pure transition-colors duration-200 ease-in-out-circ",
          isRTL && "right-auto left-4"
        )}
        aria-label="Next slide"
        disabled={isTransitioning}
      >
        {isRTL ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </button>
    </div>
  )
})

// Add displayName for React DevTools
Banner.displayName = 'Banner';
