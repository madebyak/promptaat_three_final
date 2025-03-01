'use client'

import { SearchBar } from './search-bar'
import { SortDropdown } from './sort-dropdown'
import { cn } from '@/lib/utils'

interface SearchSectionProps {
  locale?: string
  className?: string
}

export function SearchSection({ locale = 'en', className }: SearchSectionProps) {
  const isRTL = locale === 'ar'

  return (
    <div className={cn(
      "flex items-center gap-4",
      isRTL ? "flex-row-reverse" : "flex-row",
      className
    )}>
      <div className="flex-1">
        <SearchBar 
          placeholder={isRTL ? "ابحث عن الإرشادات..." : "Search prompts..."}
        />
      </div>
      <SortDropdown isRTL={isRTL} />
    </div>
  )
}
