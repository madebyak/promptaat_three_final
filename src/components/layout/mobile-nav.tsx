'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { cn } from '@/lib/utils'
import { Category as BaseCategory } from '@/types/prompts'
import { AppSidebar } from './app-sidebar'

// Extend the base Category interface with additional properties needed
interface Category extends BaseCategory {
  nameEn: string;
  nameAr: string;
  iconName: string;
  sortOrder: number;
}

interface MobileNavProps {
  categories: Category[]
  locale: string
  activeCategory: string | null
  onCategoryClick: (categoryId: string | null) => void
}

export function MobileNav({
  categories,
  locale,
  activeCategory,
  onCategoryClick,
}: MobileNavProps) {
  const isRTL = locale === 'ar'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="grid h-16 grid-cols-4 items-center border-t border-light-grey-light bg-white-pure dark:border-dark-grey dark:bg-black-main">
        {categories.slice(0, 3).map((category) => (
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
              "w-full p-0 sm:max-w-md",
              isRTL ? "rtl" : "ltr"
            )}
          >
            <AppSidebar locale={locale} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
