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
import CategoryDrawer from './category-drawer'
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

type NavigationItem = {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  locale: string
  className?: string
  items: NavigationItem[]
  children?: React.ReactNode
}

interface APIResponse {
  success: boolean
  message: string
  data: Category[]
  error?: string
}

export function Sidebar({ locale, className, items, children }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [isRTL, setIsRTL] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') === 'true' : false
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  console.log('[Sidebar Debug] Current activeCategory:', activeCategory);
  console.log('[Sidebar Debug] Categories with subcategories:', 
    categories.filter(cat => cat.subcategories && cat.subcategories.length > 0)
      .map(cat => ({ id: cat.id, name: cat.name, subcategoriesCount: cat.subcategories?.length }))
  );

  // Set RTL based on locale
  useEffect(() => {
    setIsRTL(locale === 'ar')
  }, [locale])

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true')
    } else {
      // Default to collapsed on mobile, expanded on desktop
      setIsCollapsed(window.innerWidth < 768)
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString())
  }, [isCollapsed])

  const fetchCategories = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      params.append('locale', locale)
      if (debouncedSearch) {
        params.append('query', debouncedSearch)
      }
      
      const response = await fetch(`/api/categories?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`)
      }
      
      const { success, data, message, error }: APIResponse = await response.json()
      
      if (success && Array.isArray(data)) {
        console.log('[Sidebar Debug] Categories data structure:', data.slice(0, 2));
        
        // Log detailed information about categories with subcategories
        const categoriesWithSubs = data.filter(cat => cat.subcategories && cat.subcategories.length > 0);
        console.log('[Sidebar Debug] Categories with subcategories count:', categoriesWithSubs.length);
        if (categoriesWithSubs.length > 0) {
          console.log('[Sidebar Debug] First category with subcategories:', categoriesWithSubs[0]);
          console.log('[Sidebar Debug] Subcategories of first category:', 
            categoriesWithSubs[0].subcategories?.map(sub => ({
              id: sub.id,
              name: sub.name,
              iconName: sub.iconName
            }))
          );
        }
        
        setCategories(data)
      } else {
        console.error('[Sidebar Error]:', error || message)
        setError(error || message || 'Failed to fetch categories')
      }
    } catch (err) {
      console.error('[Sidebar Error]:', err)
      setError('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [debouncedSearch, locale])

  // Auto-collapse sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Collapse on navigation on mobile
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [pathname, isCollapsed])

  const handleCategoryClick = (categoryId: string | null) => {
    console.log('[Sidebar Debug] Category clicked:', categoryId);
    const category = categories.find(c => c.id === categoryId);
    console.log('[Sidebar Debug] Category details:', category);
    
    // If clicking the same category, toggle it off
    if (activeCategory === categoryId) {
      console.log('[Sidebar Debug] Toggling category off');
      setActiveCategory(null);
      return;
    }
    
    // Check if category has subcategories
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    console.log('[Sidebar Debug] Category has subcategories:', hasSubcategories);
    
    // Set the active category
    setActiveCategory(categoryId);
    
    // If it's "All Categories" or a category without subcategories, navigate
    if (categoryId === null || !hasSubcategories) {
      console.log('[Sidebar Debug] Navigating to category page');
      router.push(categoryId === null ? `/${locale}` : `/${locale}/category/${categoryId}`);
    } else {
      console.log('[Sidebar Debug] Expanding category to show subcategories');
      // Don't navigate, just expand the category
    }
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string, e: React.MouseEvent) => {
    console.log('[Sidebar Debug] Subcategory clicked:', { categoryId, subcategoryId });
    e.stopPropagation() // Prevent category click
    
    // Find the subcategory to verify it exists
    const category = categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories?.find(s => s.id === subcategoryId);
    console.log('[Sidebar Debug] Found subcategory:', subcategory);
    
    const targetUrl = `/${locale}/category/${categoryId}/subcategory/${subcategoryId}`;
    console.log('[Sidebar Debug] Navigating to:', targetUrl);
    router.push(targetUrl);
  }

  // Render icon with fallback
  const renderCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) {
      console.log('[Sidebar Debug] No icon name provided');
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
    
    try {
      console.log(`[Sidebar Debug] Rendering icon: ${iconName}`);
      return (
        <DynamicIcon 
          name={iconName as any}
          className="h-4 w-4"
          aria-label={`Category icon`}
        />
      );
    } catch (error) {
      console.error(`[Sidebar Error] Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-light-grey-light bg-white-pure transition-all duration-300 dark:border-dark-grey dark:bg-black-main',
          isRTL ? 'right-0 border-l rtl' : 'left-0 border-r ltr',
          isCollapsed ? (isRTL ? 'w-16 translate-x-0' : 'w-16 translate-x-0') : 'w-64 translate-x-0',
          'lg:block',
          'md:block',
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
              "ml-2 h-8 w-8 text-light-grey hover:text-accent-purple transition-colors",
              isRTL && "mr-2 ml-0"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed 
              ? (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)
              : (isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />)
            }
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2">
          {isLoading ? (
            <SidebarSkeleton locale={locale} isCollapsed={isCollapsed} />
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
            <div className="space-y-1 py-2">
              {/* All Categories */}
              {!searchQuery && !isCollapsed && (
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

              {/* Collapsed All Categories */}
              {isCollapsed && (
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full aspect-square flex items-center justify-center p-2 mb-2',
                    !activeCategory && 'bg-light-grey-light dark:bg-dark-grey'
                  )}
                  onClick={() => handleCategoryClick(null)}
                  title={locale === 'ar' ? 'جميع الفئات' : 'All Categories'}
                >
                  <Search className="h-4 w-4 text-light-grey" />
                </Button>
              )}

              {/* Categories */}
              {categories.map((category) => (
                <div key={category.id} className="space-y-1">
                  {/* Expanded Category Button */}
                  {!isCollapsed && (
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
                        <span className="text-light-grey flex-shrink-0">
                          {renderCategoryIcon(category.iconName)}
                        </span>
                        <span className="flex-1">{category.name}</span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-transform",
                              activeCategory === category.id && "rotate-180",
                              isRTL && activeCategory !== category.id && "rotate-180",
                              isRTL && activeCategory === category.id && "rotate-0"
                            )}
                          />
                        )}
                      </div>
                    </Button>
                  )}

                  {/* Collapsed Category Button */}
                  {isCollapsed && (
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full aspect-square flex items-center justify-center p-2 mb-2',
                        activeCategory === category.id && 'bg-light-grey-light dark:bg-dark-grey'
                      )}
                      onClick={() => handleCategoryClick(category.id)}
                      title={category.name}
                    >
                      <span className="text-light-grey">
                        {renderCategoryIcon(category.iconName)}
                      </span>
                    </Button>
                  )}

                  {/* Subcategories - only show when not collapsed */}
                  {!isCollapsed && activeCategory === category.id && (
                    <>
                      {console.log('[Sidebar Debug] Rendering subcategories for category:', {
                        categoryId: category.id,
                        categoryName: category.name,
                        activeCategory,
                        hasSubcategories: category.subcategories && category.subcategories.length > 0,
                        subcategoriesCount: category.subcategories?.length || 0,
                        subcategories: category.subcategories
                      })}
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <>
                          {category.subcategories.map((sub) => (
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
                                <span className="text-light-grey flex-shrink-0">
                                  {renderCategoryIcon(sub.iconName)}
                                </span>
                                <span className="flex-1">{sub.name}</span>
                              </div>
                            </Button>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-2 text-sm text-light-grey">
                          {locale === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories available'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Mobile Drawer */}
      <CategoryDrawer
        categories={categories as any}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        onSubcategoryClick={handleSubcategoryClick}
        locale={locale}
        isRTL={isRTL}
      />
    </>
  )
}
