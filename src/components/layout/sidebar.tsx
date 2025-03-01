'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { SidebarSkeleton } from './sidebar-skeleton'
import { CategoryDrawer } from './category-drawer'
import { Category as BaseCategory } from '@/types/prompts'

// Extend the base Category interface with additional properties needed for the sidebar
interface Category extends BaseCategory {
  nameEn: string;
  nameAr: string;
  iconName: string;
  sortOrder: number;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count: {
    promptCategories: number;
    children: number;
    prompts?: number;
    subcategories?: number;
  };
  children?: Category[];
  subcategories?: Category[];
}

interface SidebarProps {
  locale: string
  className?: string
}

interface APIResponse {
  success: boolean
  message: string
  data: Category[]
  error?: string
}

export function Sidebar({ locale, className }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isRTL, setIsRTL] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Set RTL based on locale
  useEffect(() => {
    setIsRTL(locale === 'ar')
  }, [locale])

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        params.append('locale', locale)
        if (debouncedSearch) {
          params.append('query', debouncedSearch)
        }
        
        const response = await fetch(`/api/categories?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const { success, data, message, error }: APIResponse = await response.json()
        
        if (success && Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error('[Sidebar Error]:', error || message)
          setError(message)
          setCategories([])
        }
      } catch (error) {
        console.error('[Sidebar Error]:', error)
        setError('Failed to load categories')
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [debouncedSearch, locale])

  // Hide sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }, [pathname])

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId)
    // If it's "All Categories" or a category without children, navigate
    if (categoryId === null || !categories.find(c => c.id === categoryId)?.children?.length) {
      router.push(categoryId === null ? `/${locale}` : `/${locale}/category/${categoryId}`)
    }
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent category click
    router.push(`/${locale}/category/${categoryId}/subcategory/${subcategoryId}`)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col border-light-grey-light bg-white-pure transition-all duration-300 dark:border-dark-grey dark:bg-black-main',
          isRTL ? 'right-0 border-l rtl' : 'left-0 border-r ltr',
          isCollapsed && (isRTL ? '-translate-x-48 transform' : 'translate-x-48 transform'),
          'max-md:hidden',
          className
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center px-4 py-2">
          {!isCollapsed && (
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-2.5 h-4 w-4 text-light-grey",
                isRTL ? "right-2" : "left-2"
              )} />
              <Input
                placeholder={locale === 'ar' ? "البحث في الفئات..." : "Search categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "bg-light-white dark:bg-dark border-light-grey-light dark:border-dark-grey text-dark dark:text-white-pure placeholder:text-light-grey w-full",
                  isRTL ? "pr-8" : "pl-8"
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-2 h-6 w-6 text-light-grey hover:text-accent-purple",
              isRTL && "mr-2 ml-0 rotate-180"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <SidebarSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-light-grey">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-accent-purple hover:text-accent-purple-dark"
                onClick={() => {
                  setSearchQuery('')
                  setError(null)
                }}
              >
                {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-sm text-light-grey">
                {locale === 'ar' ? 'لا توجد فئات متاحة' : 'No categories available'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {/* All Categories */}
              {!searchQuery && (
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                    !activeCategory && 'bg-light-grey-light dark:bg-dark-grey',
                    'flex items-center',
                    isRTL ? 'text-right' : 'text-left'
                  )}
                  onClick={() => handleCategoryClick(null)}
                >
                  <div className={cn(
                    'flex items-center gap-x-3 w-full',
                    isRTL ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <Search className="h-4 w-4 text-light-grey" />
                    <span className="flex-1">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</span>
                  </div>
                </Button>
              )}

              {/* Categories */}
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                      activeCategory === category.id && 'bg-light-grey-light dark:bg-dark-grey',
                      'flex items-center',
                      isRTL ? 'text-right' : 'text-left'
                    )}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <div className={cn(
                      'flex items-center gap-x-3 w-full',
                      isRTL ? 'flex-row-reverse' : 'flex-row'
                    )}>
                      {category.iconName && (
                        <span className="text-light-grey flex-shrink-0">
                          <DynamicIcon 
                            name={category.iconName as any}
                            className="h-4 w-4"
                            aria-label={`${category.name} icon`}
                          />
                        </span>
                      )}
                      <span className="flex-1">{category.name}</span>
                      {category.children && category.children.length > 0 && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 flex-shrink-0 transition-transform",
                            activeCategory === category.id && "rotate-180",
                            isRTL && "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </Button>

                  {/* Subcategories */}
                  {activeCategory === category.id && category.children?.map((sub) => (
                    <Button
                      key={sub.id}
                      variant="ghost"
                      className={cn(
                        'w-full text-sm text-light-grey hover:text-accent-purple dark:text-light-grey-low dark:hover:text-accent-purple px-4 py-2',
                        isRTL ? 'text-right pr-8' : 'text-left pl-8',
                        'flex items-center'
                      )}
                      onClick={(e) => handleSubcategoryClick(category.id, sub.id, e)}
                    >
                      <div className={cn(
                        'flex items-center gap-x-3 w-full',
                        isRTL ? 'flex-row-reverse' : 'flex-row'
                      )}>
                        {sub.iconName && (
                          <span className="text-light-grey flex-shrink-0">
                            <DynamicIcon 
                              name={sub.iconName as any}
                              className="h-4 w-4"
                              aria-label={`${sub.name} icon`}
                            />
                          </span>
                        )}
                        <span className="flex-1">{sub.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Mobile Drawer */}
      <CategoryDrawer
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        onSubcategoryClick={handleSubcategoryClick}
        locale={locale}
        isRTL={isRTL}
      />
    </>
  )
}
