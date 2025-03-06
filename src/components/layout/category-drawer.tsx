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
import { useState } from 'react'

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
  onSubcategoryClick?: (categoryId: string) => void
  locale: string
  isRTL: boolean
}

function CategoryDrawer({
  categories,
  activeCategory,
  onCategoryClick,
  onSubcategoryClick,
  locale,
  isRTL,
}: CategoryDrawerProps) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle category menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Categories</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1 p-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.iconName && (
                  <DynamicIcon
                    name={category.iconName as any}
                    className="mr-2 h-4 w-4"
                  />
                )}
                <span>{category.nameEn}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default CategoryDrawer
