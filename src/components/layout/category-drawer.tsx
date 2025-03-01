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
  return (
    <>
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-light-grey-light bg-white-pure dark:border-dark-grey dark:bg-black-main md:hidden">
        {categories.slice(0, 4).map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="icon"
            className={cn(
              "text-light-grey hover:text-accent-purple",
              activeCategory === category.id && "text-accent-purple"
            )}
            onClick={() => onCategoryClick(category.id)}
          >
            {category.iconName && (
              <DynamicIcon 
                name={category.iconName as any}
                className="h-5 w-5"
                aria-label={`${category.name} icon`}
              />
            )}
          </Button>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-light-grey hover:text-accent-purple"
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
            <SheetHeader>
              <SheetTitle className={cn(
                "text-center",
                isRTL ? "text-right" : "text-left"
              )}>
                {locale === 'ar' ? 'الفئات' : 'Categories'}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-1 p-2">
                {/* All Categories */}
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full text-sm hover:bg-light-grey-light dark:hover:bg-dark-grey px-4 py-2',
                    !activeCategory && 'bg-light-grey-light dark:bg-dark-grey',
                    'flex items-center',
                    isRTL ? 'text-right' : 'text-left'
                  )}
                  onClick={() => onCategoryClick(null)}
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
                      onClick={() => onCategoryClick(category.id)}
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
                        {category.subcategories && category.subcategories.length > 0 && (
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
                    {activeCategory === category.id && category.subcategories?.map((sub) => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        className={cn(
                          'w-full text-sm text-light-grey hover:text-accent-purple dark:text-light-grey-low dark:hover:text-accent-purple px-4 py-2',
                          isRTL ? 'text-right pr-8' : 'text-left pl-8',
                          'flex items-center'
                        )}
                        onClick={(e) => onSubcategoryClick(category.id, sub.id, e)}
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
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  )
}
