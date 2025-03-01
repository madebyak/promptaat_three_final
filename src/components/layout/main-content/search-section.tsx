'use client'

import { cn } from '@/lib/utils'

interface SearchSectionProps {
  locale?: string
  className?: string
}

export function SearchSection({ locale = 'en', className }: SearchSectionProps) {
  const isRTL = locale === 'ar'

  return (
    <section className={cn(
      "w-full mx-6",
      className
    )}>
      <div className="flex flex-col items-center">
        {/* Search content will go here */}
        <div className="w-full h-16 bg-light-grey-light dark:bg-dark-grey rounded-lg">
          {/* Placeholder for search implementation */}
        </div>
      </div>
    </section>
  )
}
