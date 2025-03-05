'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, Menu, Search } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types/prompts'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useState } from 'react'

interface CategoryItem extends Category {
  iconName?: string;
  subcategories?: CategoryItem[];
}

interface CategoryDrawerProps {
  categories: CategoryItem[]
  activeCategory: string | null
  onCategoryClick: (categoryId: string | null) => void
  onSubcategoryClick: (categoryId: string, subcategoryId: string, e: React.MouseEvent) => void
  locale: string
  isRTL: boolean
}

export function CategoryDrawer({
  categories,
  activeCategory,
  onCategoryClick,
  onSubcategoryClick,
  locale,
  isRTL,
}: CategoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  
  // Filtered categories based on search
  const filteredCategories = searchQuery 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;
  
  // Render icon with fallback
  const renderCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) return null;
    
    try {
      return (
        <DynamicIcon 
          name={iconName as any}
          className="h-4 w-4"
          aria-label={`Category icon`}
        />
      );
    } catch (error) {
      console.error(`Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  };

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-light-grey-light bg-white-pure dark:border-dark-grey dark:bg-black-main md:hidden">
        {/* Show "All Categories" button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-light-grey hover:text-accent-purple",
            !activeCategory && "text-accent-purple"
          )}
          onClick={() => onCategoryClick(null)}
          aria-label={locale === 'ar' ? 'جميع الفئات' : 'All Categories'}
        >
          <Search className="h-5 w-5" />
        </Button>
        
        {/* Show first 3 categories with icons */}
        {categories.slice(0, 3).map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="icon"
            className={cn(
              "text-light-grey hover:text-accent-purple relative",
              activeCategory === category.id && "text-accent-purple"
            )}
            onClick={() => onCategoryClick(category.id)}
            aria-label={category.name}
          >
            <span className="text-light-grey">
              {renderCategoryIcon(category.iconName)}
            </span>
            
            {/* Active indicator dot */}
            {activeCategory === category.id && (
              <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-purple" />
            )}
          </Button>
        ))}
        
        {/* More categories drawer */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-light-grey hover:text-accent-purple"
              aria-label={locale === 'ar' ? 'المزيد من الفئات' : 'More categories'}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side={isRTL ? 'right' : 'left'} 
            className={cn(
              "w-full sm:max-w-md",
              isRTL ? "rtl" : "ltr"
            )}
          >
            <SheetHeader className="mb-4">
              <SheetTitle className={cn(
                "text-center",
                isRTL ? "text-right" : "text-left"
              )}>
                {locale === 'ar' ? 'الفئات' : 'Categories'}
              </SheetTitle>
            </SheetHeader>
            
            {/* Search input */}
            <div className="relative mb-4 px-2">
              <Search className={cn(
                "absolute top-2.5 h-4 w-4 text-light-grey",
                isRTL ? "right-4" : "left-4"
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
            
            <ScrollArea className="h-[calc(100vh-10rem)] px-2">
              <div className="space-y-1 py-2">
                {/* All Categories */}
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                    !activeCategory && 'bg-light-grey-light dark:bg-dark-grey',
                    'flex items-center',
                    isRTL ? 'text-right' : 'text-left'
                  )}
                  onClick={() => {
                    onCategoryClick(null);
                    setIsOpen(false);
                  }}
                >
                  <div className={cn(
                    'flex items-center gap-x-3 w-full',
                    isRTL ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <Search className="h-4 w-4 text-light-grey" />
                    <span className="flex-1">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</span>
                  </div>
                </Button>

                {/* Categories */}
                {filteredCategories.length === 0 ? (
                  <div className="py-4 text-center text-light-grey">
                    {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category.id} className="space-y-1">
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                          activeCategory === category.id && 'bg-light-grey-light dark:bg-dark-grey',
                          'flex items-center',
                          isRTL ? 'text-right' : 'text-left'
                        )}
                        onClick={() => {
                          onCategoryClick(category.id);
                          if (!category.subcategories?.length) {
                            setIsOpen(false);
                          }
                        }}
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

                      {/* Subcategories */}
                      {activeCategory === category.id && (
                        <>
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
                                  onClick={(e) => {
                                    onSubcategoryClick(category.id, sub.id, e);
                                    setIsOpen(false);
                                  }}
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
                            <div className="px-4 py-2 text-sm text-light-grey text-center">
                              {locale === 'ar' ? 'لا توجد فئات فرعية' : 'No subcategories available'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}
