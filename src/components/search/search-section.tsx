'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchBar } from './search-bar'
import { SortDropdown } from './sort-dropdown'
import { ToolsFilter } from './tools-filter'
import { cn } from '@/lib/utils'

interface SearchSectionProps {
  locale?: string
  className?: string
}

export function SearchSection({ locale = 'en', className = '' }: SearchSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRTL = locale === 'ar'
  
  // Get initial values from URL
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '')
  const [sortOption, setSortOption] = useState<string>(searchParams.get('sort') || '')
  
  // Handle multiple tool filters
  const [toolFilters, setToolFilters] = useState<string[] | null>(() => {
    const toolParam = searchParams.get('tools')
    return toolParam ? toolParam.split(',') : null
  })
  
  // Debounce search to prevent too many URL updates
  useEffect(() => {
    // Store current URL params to compare before updating
    const currentParams = new URLSearchParams(searchParams.toString())
    const currentQ = currentParams.get('q') || ''
    const currentSort = currentParams.get('sort') || ''
    const currentTools = currentParams.get('tools') || ''
    
    // Check if any values have actually changed
    const hasSearchChanged = searchTerm !== currentQ
    const hasSortChanged = sortOption !== currentSort
    const hasToolsChanged = (
      toolFilters && toolFilters.length > 0 ? 
      toolFilters.sort().join(',') !== currentTools :
      !!currentTools
    )
    
    // Only update if something has changed
    if (!hasSearchChanged && !hasSortChanged && !hasToolsChanged) {
      return
    }
    
    const handler = setTimeout(() => {
      const params = new URLSearchParams()
      
      // Update search query param
      if (searchTerm) {
        params.set('q', searchTerm)
      }
      
      // Update sort param
      if (sortOption) {
        params.set('sort', sortOption)
      }
      
      // Update tool filters param
      if (toolFilters && toolFilters.length > 0) {
        params.set('tools', toolFilters.join(','))
      }
      
      // Update URL with new params
      const newUrl = `/${locale}${params.toString() ? `?${params.toString()}` : ''}`
      router.push(newUrl, { scroll: false })
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, sortOption, toolFilters, searchParams, router, locale])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleSort = (value: string) => {
    setSortOption(value)
  }
  
  const handleToolFilter = (value: string[] | null) => {
    setToolFilters(value)
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Responsive layout that stacks on mobile */}
      <div className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center gap-3",
        isRTL ? "md:flex-row-reverse" : "md:flex-row"
      )}>
        {/* Search bar - takes remaining space */}
        <div className="flex-1 mb-3 md:mb-0">
          <SearchBar 
            placeholder={isRTL ? "ابحث عن الإرشادات..." : "Search prompts..."}
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
        
        {/* Filter and sort container - stacks horizontally on mobile */}
        <div className={cn(
          "flex items-center gap-3",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Filter by tool - responsive width */}
          <div className="flex-1 md:flex-none md:w-[170px]">
            <ToolsFilter
              locale={locale}
              isRTL={isRTL}
              onValueChange={handleToolFilter}
              value={toolFilters}
              className="w-full whitespace-nowrap"
            />
          </div>
          
          {/* Sort dropdown - responsive width */}
          <div className="flex-1 md:flex-none md:w-[170px]">
            <SortDropdown 
              isRTL={isRTL} 
              onValueChange={handleSort}
              value={sortOption}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
