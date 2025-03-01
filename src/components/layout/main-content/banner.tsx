'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BannerProps {
  locale?: string
  className?: string
}

interface BannerContent {
  headline: string
  subheading: string
}

const content: Record<string, BannerContent> = {
  en: {
    headline: "Elevate Your AI Conversations",
    subheading: "Discover and share powerful prompts that unlock the full potential of AI tools"
  },
  ar: {
    headline: "ارتقِ بمحادثاتك مع الذكاء الاصطناعي",
    subheading: "اكتشف وشارك أقوى الإرشادات التي تطلق العنان لإمكانات أدوات الذكاء الاصطناعي"
  }
}

export function Banner({ locale = 'en', className }: BannerProps) {
  const isRTL = locale === 'ar'
  const { headline, subheading } = content[locale] || content.en

  return (
    <div className={cn(
      "relative h-60 w-full rounded-lg overflow-hidden",
      className
    )}>
      {/* Background Image */}
      <Image
        src="/Banner_img_01.jpg"
        alt="Banner Background"
        fill
        priority
        quality={90}
        className="object-cover object-center"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black-main/40" />

      {/* Content */}
      <div className="relative h-full flex items-center p-6">
        <div className={cn(
          "max-w-2xl",
          isRTL ? "text-right" : "text-left"
        )}>
          <h1 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold text-white-pure mb-4",
            isRTL ? "font-ibm-plex-sans-arabic" : "font-ibm-plex-sans"
          )}>
            {headline}
          </h1>
          <p className={cn(
            "text-base md:text-lg text-white-pure/90",
            isRTL ? "font-ibm-plex-sans-arabic" : "font-ibm-plex-sans"
          )}>
            {subheading}
          </p>
        </div>
      </div>
    </div>
  )
}
