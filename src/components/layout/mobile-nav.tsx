'use client'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import { cn } from '@/lib/utils'
import { Category as BaseCategory } from '@/types/prompts'
import { AppSidebar } from './app-sidebar'
import Link from 'next/link'

// Extend the base Category interface with additional properties needed
interface Category extends BaseCategory {
  nameEn: string;
  nameAr: string;
  iconName: string;
  sortOrder: number;
}

type NavigationItem = {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MobileNavProps {
  categories: Category[]
  locale: string
  activeCategory: string | null
  onCategoryClick: (categoryId: string | null) => void
  items: NavigationItem[]
  children?: React.ReactNode
}

export function MobileNav({
  categories,
  locale,
  activeCategory,
  onCategoryClick,
  items,
  children,
}: MobileNavProps) {
  const isRTL = locale === 'ar'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="grid h-20 grid-cols-4 items-center border-t border-light-grey-light bg-white-pure dark:border-dark-grey dark:bg-black-main">
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
              <div className="relative flex-shrink-0">
                {/* Using type assertion to handle dynamic icon names */}
                <DynamicIcon 
                  // @ts-expect-error - Lucide expects specific icon names but we're using dynamic names from DB
                  name={category.iconName}
                  className="h-5 w-5"
                  aria-label={`${locale === 'ar' ? category.nameAr : category.nameEn} icon`}
                />
              </div>
            )}
            <span className="text-xs mt-1">{locale === 'ar' ? category.nameAr : category.nameEn}</span>
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around border-t border-light-grey-light bg-white-pure dark:border-dark-grey dark:bg-black-main md:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-sm text-light-grey hover:text-accent-purple",
              isRTL && "flex-row-reverse"
            )}
          >
            {item.icon && (
              <item.icon className="h-5 w-5" />
            )}
            <span>{item.label}</span>
          </Link>
        ))}
        {children}
      </nav>
    </nav>
  )
}
