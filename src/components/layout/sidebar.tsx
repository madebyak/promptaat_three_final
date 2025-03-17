'use client'

import React, { useEffect, useState, useCallback, memo, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Search, LayoutDashboard, MessageSquare, FolderTree, Wrench, Users } from 'lucide-react'
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
  icon?: string
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

// Memoized search input component that manages its own state to prevent re-renders from parent affecting focus
const SidebarSearchInput = memo(({ 
  placeholder, 
  onChange, 
  value: externalValue, 
  isRTL 
}: { 
  placeholder: string; 
  onChange: (value: string) => void; 
  value: string; 
  isRTL: boolean; 
}) => {
  // Use internal state for the input value to prevent focus loss during parent re-renders
  const [internalValue, setInternalValue] = useState(externalValue);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Sync internal value with external value when it changes from outside
  useEffect(() => {
    if (externalValue !== internalValue) {
      setInternalValue(externalValue);
    }
  }, [externalValue, internalValue]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };
  
  // Focus preservation logic
  useEffect(() => {
    // Auto-focus and restore cursor position on mount
    if (inputRef.current) {
      const end = inputRef.current.value.length;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(end, end);
    }
  }, []);
  
  return (
    <div className="relative flex-1">
      <Search className={cn(
        "absolute top-2.5 h-4 w-4 text-light-grey",
        isRTL ? "right-2" : "left-2"
      )} />
      <Input
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onFocus={() => {
          // When focusing, ensure the cursor is at the end
          if (inputRef.current) {
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
          }
        }}
        ref={inputRef}
        className={cn(
          "bg-light-white dark:bg-dark border-light-grey-light dark:border-dark-grey text-dark dark:text-white-pure placeholder:text-light-grey w-full",
          isRTL ? "pr-8" : "pl-8"
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
    </div>
  );
});

// Add display name for debugging
SidebarSearchInput.displayName = "SidebarSearchInput";

export function Sidebar({ locale, className, items = [] }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isRTL, setIsRTL] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') === 'true' : false
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Simple state for search query - same pattern as the working SearchBar
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // We need the useTheme hook for dark mode support, but don't need to use the theme value directly
  const { } = useTheme()

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

  // Extract category and subcategory IDs from the pathname
  useEffect(() => {
    if (!pathname || categories.length === 0) return;
    
    console.log('[Sidebar Debug] Current pathname:', pathname);
    console.log('[Sidebar Debug] Available categories:', categories.map(c => ({ id: c.id, name: c.nameEn })));
    
    // First, try to match the standard category/subcategory pattern
    // Pattern: /{locale}/category/{categoryId}/subcategory/{subcategoryId}
    const standardPattern = pathname.match(/\/[^\/]+\/category\/([^\/]+)(?:\/subcategory\/([^\/]+))?/)
    
    if (standardPattern) {
      const categoryId = standardPattern[1]
      const subcategoryId = standardPattern[2] || null
      
      console.log('[Sidebar Debug] Matched standard pattern - Category:', categoryId, 'Subcategory:', subcategoryId)
      
      setActiveCategory(categoryId)
      setActiveSubcategory(subcategoryId)
      return
    }
    
    // If standard pattern doesn't match, try to match direct category/subcategory names in the URL
    // Pattern: /{locale}/{categoryName}/{subcategoryName}
    const segments = pathname.split('/').filter(Boolean)
    console.log('[Sidebar Debug] URL segments:', segments)
    
    if (segments.length >= 2) {
      const localeSegment = segments[0]
      const categorySegment = segments[1]
      const subcategorySegment = segments.length >= 3 ? segments[2] : null
      
      console.log('[Sidebar Debug] Extracted segments - Locale:', localeSegment, 
        'Category:', categorySegment, 'Subcategory:', subcategorySegment)
      
      // Find matching category by name (case insensitive)
      const matchedCategory = categories.find(cat => 
        cat.nameEn.toLowerCase() === categorySegment.toLowerCase() || 
        cat.nameAr.toLowerCase() === categorySegment.toLowerCase() ||
        cat.id === categorySegment
      )
      
      if (matchedCategory) {
        console.log('[Sidebar Debug] Found matching category:', matchedCategory.id, matchedCategory.nameEn)
        setActiveCategory(matchedCategory.id)
        
        // If we have a subcategory segment, try to find a matching subcategory
        if (subcategorySegment && matchedCategory.subcategories) {
          // Convert kebab-case or snake_case to space-separated for comparison
          const normalizedSubcategorySegment = subcategorySegment
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .toLowerCase()
          
          // Find matching subcategory by name (case insensitive)
          const matchedSubcategory = matchedCategory.subcategories.find(sub => {
            const normalizedNameEn = sub.nameEn.toLowerCase()
            const normalizedNameAr = sub.nameAr.toLowerCase()
            
            // Also check for kebab-case and snake_case variations of the name
            const kebabNameEn = sub.nameEn.toLowerCase().replace(/\s+/g, '-')
            const snakeNameEn = sub.nameEn.toLowerCase().replace(/\s+/g, '_')
            
            return normalizedNameEn === normalizedSubcategorySegment || 
                   normalizedNameAr === normalizedSubcategorySegment ||
                   kebabNameEn === subcategorySegment.toLowerCase() ||
                   snakeNameEn === subcategorySegment.toLowerCase() ||
                   sub.id === subcategorySegment
          })
          
          if (matchedSubcategory) {
            console.log('[Sidebar Debug] Found matching subcategory:', 
              matchedSubcategory.id, matchedSubcategory.nameEn)
            setActiveSubcategory(matchedSubcategory.id)
          } else {
            console.log('[Sidebar Debug] No matching subcategory found for:', subcategorySegment)
            setActiveSubcategory(null)
          }
        } else {
          setActiveSubcategory(null)
        }
      } else {
        console.log('[Sidebar Debug] No matching category found for:', categorySegment)
        setActiveCategory(null)
        setActiveSubcategory(null)
      }
      return
    }
    
    // If no patterns match, reset active states
    setActiveCategory(null)
    setActiveSubcategory(null)
  }, [pathname, categories])

  const fetchCategories = useCallback(async () => {
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
    } catch (err: unknown) {
      console.error('[Sidebar Error]:', err)
      setError('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }, [locale, debouncedSearch])

  useEffect(() => {
    fetchCategories()
  }, [debouncedSearch, fetchCategories])

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
    
    // If clicking the same category and there are no subcategories, toggle it off
    if (activeCategory === categoryId && (!category?.subcategories || category.subcategories.length === 0)) {
      console.log('[Sidebar Debug] Toggling category off (no subcategories)');
      setActiveCategory(null);
      setActiveSubcategory(null);
      router.push(`/${locale}`);
      return;
    }
    
    // If clicking the same category with subcategories, keep it active but clear subcategory selection
    if (activeCategory === categoryId && category?.subcategories && category.subcategories.length > 0) {
      console.log('[Sidebar Debug] Navigating to category page (clearing subcategory)');
      setActiveSubcategory(null);
      router.push(`/${locale}/category/${categoryId}`);
      return;
    }
    
    // Check if category has subcategories
    const hasSubcategories = category?.subcategories && category.subcategories.length > 0;
    console.log('[Sidebar Debug] Category has subcategories:', hasSubcategories);
    
    // Set the active category and clear any active subcategory
    setActiveCategory(categoryId);
    setActiveSubcategory(null);
    
    // If it's "All Categories" or a category without subcategories, navigate
    if (categoryId === null || !hasSubcategories) {
      console.log('[Sidebar Debug] Navigating to category page');
      router.push(categoryId === null ? `/${locale}` : `/${locale}/category/${categoryId}`);
    } else {
      console.log('[Sidebar Debug] Expanding category and navigating to category page');
      // Navigate to the category page
      router.push(`/${locale}/category/${categoryId}`);
    }
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string, e: React.MouseEvent) => {
    console.log('[Sidebar Debug] Subcategory clicked:', { categoryId, subcategoryId });
    e.stopPropagation() // Prevent category click
    
    // Find the subcategory to verify it exists
    const category = categories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories?.find(s => s.id === subcategoryId);
    console.log('[Sidebar Debug] Found subcategory:', subcategory);
    
    // Update active states - keep both category and subcategory active
    setActiveCategory(categoryId);
    setActiveSubcategory(subcategoryId);
    
    const targetUrl = `/${locale}/category/${categoryId}/subcategory/${subcategoryId}`;
    console.log('[Sidebar Debug] Navigating to:', targetUrl);
    router.push(targetUrl);
  }

  // Render icon with fallback
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) {
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
    
    // Map string icon names to actual components
    const iconMap: Record<string, React.ReactNode> = {
      'LayoutDashboard': <LayoutDashboard className="h-4 w-4" />,
      'MessageSquare': <MessageSquare className="h-4 w-4" />,
      'FolderTree': <FolderTree className="h-4 w-4" />,
      'Wrench': <Wrench className="h-4 w-4" />,
      'Users': <Users className="h-4 w-4" />,
      'Search': <Search className="h-4 w-4" />,
      'AlertCircle': <AlertCircle className="h-4 w-4" />,
      // Add more icons as needed
    };
    
    // Try to find the icon in our map
    if (iconName in iconMap) {
      return iconMap[iconName];
    }
    
    // If not found, use DynamicIcon
    try {
      return (
        <DynamicIcon
          // @ts-expect-error - Lucide expects specific icon names but we're using dynamic names from DB
          name={iconName}
          className="h-4 w-4"
        />
      );
    } catch (error) {
      console.error(`Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  };
  
  // Render category icon with fallback
  const renderCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) {
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
    
    try {
      // Directly use renderIcon which now handles both static and dynamic icons
      return renderIcon(iconName);
    } catch (error) {
      console.error(`[Sidebar Error] Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  };

  // Determine if we should render CMS navigation items or categories
  const isCmsPath = pathname?.startsWith('/cms');
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-light-grey-light bg-white-pure transition-all duration-200 ease-in-out dark:border-dark-grey dark:bg-black-main',
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
            <SidebarSearchInput
              placeholder={locale === 'ar' ? "البحث في الفئات..." : "Search categories..."}
              onChange={setSearchQuery}
              value={searchQuery}
              isRTL={isRTL}
            />
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

        <ScrollArea className="flex-1 px-2 group">
          {isCmsPath && items.length > 0 ? (
            // Render CMS navigation items
            <div className="space-y-1 py-2">
              {items.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                    pathname === item.href && 'bg-light-grey-light dark:bg-dark-grey',
                    'flex items-center',
                    isRTL ? 'text-right' : 'text-left'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <div className={cn(
                    'flex items-center gap-x-3 w-full',
                    isRTL ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    {item.icon && (
                      <span className="text-light-grey flex-shrink-0">
                        {renderIcon(item.icon)}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          ) : isLoading ? (
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
              {/* Categories header - only show when not collapsed */}
              {!isCollapsed && (
                <div className="px-4 py-2">
                  <h3 className="text-sm font-medium text-light-grey">
                    {locale === 'ar' ? 'الفئات' : 'Categories'}
                  </h3>
                </div>
              )}
              
              {/* All Categories */}
              {!isCollapsed && (
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
                    <span className="text-light-grey flex-shrink-0">
                      <Search className="h-4 w-4" />
                    </span>
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
                        'flex items-center gap-x-3 w-full transition-opacity duration-200 ease-in-out',
                        isRTL ? 'flex-row-reverse' : 'flex-row'
                      )}>
                        <span className={cn(
                          "text-light-grey flex-shrink-0 inline-flex items-center justify-center w-5 h-5",
                          activeCategory === category.id && "text-accent-purple"
                        )}>
                          {renderCategoryIcon(category.iconName)}
                        </span>
                        <span className={cn(
                          "flex-1",
                          activeCategory === category.id && "font-medium text-accent-purple"
                        )}>
                          {locale === 'ar' ? category.nameAr : category.nameEn}
                        </span>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-in-out",
                              (activeCategory === category.id) && "rotate-180 text-accent-purple",
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
                      <span className={cn(
                        "text-light-grey flex-shrink-0 inline-flex items-center justify-center w-5 h-5",
                        activeCategory === category.id && "text-accent-purple"
                      )}>
                        {renderCategoryIcon(category.iconName)}
                      </span>
                    </Button>
                  )}

                  {/* Subcategories - only show when not collapsed and category is active */}
                  {!isCollapsed && activeCategory === category.id && (
                    <div className="transition-all duration-200 ease-in-out">
                      {category.subcategories && category.subcategories.length > 0 ? (
                        <>
                          {category.subcategories.map((sub) => {
                            // Debug log to help identify why subcategory isn't highlighted
                            const isActive = activeSubcategory === sub.id;
                            if (isActive) {
                              console.log('[Sidebar Debug] Rendering active subcategory:', sub.id, sub.nameEn);
                            }
                            
                            return (
                              <Button
                                key={sub.id}
                                variant="ghost"
                                className={cn(
                                  'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                                  isRTL ? 'text-right pr-8' : 'text-left pl-8',
                                  'flex items-center',
                                  isRTL ? 'flex-row-reverse' : 'flex-row',
                                  isActive && 'bg-light-grey-light dark:bg-dark-grey text-accent-purple'
                                )}
                                onClick={(e) => handleSubcategoryClick(category.id, sub.id, e)}
                              >
                                <div className={cn(
                                  'flex items-center gap-x-3 w-full',
                                  isRTL ? 'flex-row-reverse' : 'flex-row'
                                )}>
                                  <span className={cn(
                                    "text-light-grey flex-shrink-0 inline-flex items-center justify-center w-5 h-5",
                                    isActive && "text-accent-purple"
                                  )}>
                                    {renderCategoryIcon(sub.iconName)}
                                  </span>
                                  <span className={cn(
                                    "flex-1",
                                    isActive && "font-medium text-accent-purple"
                                  )}>
                                    {locale === 'ar' ? sub.nameAr : sub.nameEn}
                                  </span>
                                </div>
                              </Button>
                            );
                          })}
                        </>
                      ) : (
                        <div className="px-4 py-2 text-sm text-light-grey">
                          {locale === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Mobile Drawer */}
      <CategoryDrawer
        // The Category type is compatible with CategoryItem in category-drawer.tsx
        // but TypeScript has issues with the recursive nature of the types
        // We need to use a type assertion here because of the recursive structure
        categories={categories.map(cat => ({
          id: cat.id,
          nameEn: cat.nameEn,
          nameAr: cat.nameAr,
          iconName: cat.iconName,
          parentId: cat.parentId || null,
          sortOrder: cat.sortOrder,
          // Explicitly handle the recursive structure
          children: cat.children ? cat.children.map(child => ({
            id: child.id,
            nameEn: child.nameEn,
            nameAr: child.nameAr,
            iconName: child.iconName,
            parentId: child.parentId || null,
            sortOrder: child.sortOrder
          })) : undefined,
          subcategories: cat.subcategories ? cat.subcategories.map(sub => ({
            id: sub.id,
            nameEn: sub.nameEn,
            nameAr: sub.nameAr,
            iconName: sub.iconName,
            parentId: sub.parentId || null,
            sortOrder: sub.sortOrder
          })) : undefined
        }))}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        onSubcategoryClick={handleSubcategoryClick}
        locale={locale}
        isRTL={isRTL}
      />
    </>
  )
}
