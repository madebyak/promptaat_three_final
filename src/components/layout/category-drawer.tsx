'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

type CategoryItem = {
  id: string
  nameEn: string
  nameAr: string
  iconName: string
  parentId: string | null
  sortOrder: number
  children?: CategoryItem[]
  subcategories?: CategoryItem[]
}

interface CategoryDrawerProps {
  categories: CategoryItem[]
  activeCategory: string | null
  onCategoryClick: (categoryId: string) => void
  onSubcategoryClick?: (categoryId: string, subcategoryId: string, e: React.MouseEvent) => void
  locale: string
  isRTL?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function CategoryDrawer({
  categories,
  activeCategory,
  onCategoryClick,
  onSubcategoryClick,
  locale = 'en',
  isRTL = false,
  open,
  onOpenChange,
}: CategoryDrawerProps) {
  useTheme()
  const [isOpen, setIsOpen] = useState(open || false)
  
  // Helper function to render category icons with error handling
  const renderCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) {
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
    
    try {
      return (
        <DynamicIcon
          // @ts-expect-error - Lucide expects specific icon names but we're using dynamic names from DB
          name={iconName}
          className="h-4 w-4"
        />
      );
    } catch (error) {
      console.error(`[CategoryDrawer Error] Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId)
    setIsOpen(false)
  }

  // Use controlled open state if provided, otherwise use internal state
  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setIsOpen(value);
    }
  }

  // Update internal state when controlled prop changes
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <Sheet open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle category menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{locale === 'ar' ? 'الفئات' : 'Categories'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1 p-2">
            {categories.map((category) => (
              <div key={category.id} className="space-y-1">
                <Button
                  variant={activeCategory === category.id ? "secondary" : "ghost"}
                  className={`w-full justify-${isRTL ? 'end' : 'start'}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className={`flex items-center w-full ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    {category.iconName && (
                      <span className="text-light-grey flex-shrink-0 inline-flex items-center justify-center w-5 h-5">
                        {/* Using type assertion to handle dynamic icon names */}
                        {renderCategoryIcon(category.iconName)}
                      </span>
                    )}
                    <span>{locale === 'ar' ? category.nameAr : category.nameEn}</span>
                  </div>
                </Button>
                
                {/* Render subcategories if this category is active */}
                {activeCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                  <div className={`pl-${isRTL ? '0 pr-4' : '4 pr-0'} space-y-1`}>
                    {category.subcategories.map((subcategory) => (
                      <Button
                        key={subcategory.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-${isRTL ? 'end' : 'start'} text-sm`}
                        onClick={(e) => {
                          if (onSubcategoryClick) {
                            onSubcategoryClick(category.id, subcategory.id, e);
                            setIsOpen(false);
                          }
                        }}
                      >
                        <div className={`flex items-center w-full ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                          {subcategory.iconName && (
                            <span className="text-light-grey flex-shrink-0 inline-flex items-center justify-center w-5 h-5">
                              {renderCategoryIcon(subcategory.iconName)}
                            </span>
                          )}
                          <span>{locale === 'ar' ? subcategory.nameAr : subcategory.nameEn}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default CategoryDrawer
