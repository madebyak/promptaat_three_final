"use client"

import { Fragment, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { DynamicIcon } from "lucide-react/dynamic"
import { cn } from "@/lib/utils"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SidebarSkeleton } from "./sidebar-skeleton"
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { Category as BaseCategory } from "@/types/prompts"

interface Category extends BaseCategory {
  nameEn: string
  nameAr: string
  iconName: string
  sortOrder: number
  parentId?: string | null
  createdAt?: string
  updatedAt?: string
  _count: {
    promptCategories: number
    children: number
    prompts?: number
    subcategories?: number
  }
  children?: Category[]
  subcategories?: Category[]
}

interface AppSidebarProps {
  locale: string
  className?: string
}

interface APIResponse {
  success: boolean
  message: string
  data: Category[]
  error?: string
}

export function AppSidebar({ locale, className }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isRTL = locale === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Helper function to render category icons
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
      console.error(`[Sidebar Error] Failed to render icon: ${iconName}`, error);
      return <div className="h-4 w-4 bg-muted rounded-sm" />;
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Add a small delay to ensure API is ready (helps during development)
        if (process.env.NODE_ENV === 'development') {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        const params = new URLSearchParams()
        params.append("locale", locale)
        if (debouncedSearch) {
          params.append("query", debouncedSearch)
        }
        
        console.log("[Sidebar] Fetching categories with params:", params.toString())
        
        // Use absolute URL to avoid path resolution issues
        const apiUrl = window.location.origin + `/api/categories?${params.toString()}`
        console.log("[Sidebar] Full API URL:", apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Add cache control to avoid stale data
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[Sidebar] HTTP error! status: ${response.status}, response:`, errorText)
          throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`)
        }
        
        const responseData = await response.json()
        const { success, data, message, error }: APIResponse = responseData
        
        console.log("[Sidebar] Categories API response:", { success, dataCount: data?.length, message, error })
        
        if (success && Array.isArray(data)) {
          setCategories(data)
        } else {
          console.error("[Sidebar Error]:", error || message)
          setError(message || "Failed to load categories data")
          setCategories([])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error("[Sidebar Error]:", errorMessage)
        setError("Failed to load categories. Try Again")
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [debouncedSearch, locale])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false)
    }
  }, [pathname])

  const handleCategoryClick = (categoryId: string | null) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId)
    
    if (categoryId === null || !categories.find(c => c.id === categoryId)?.subcategories?.length) {
      router.push(categoryId === null ? `/${locale}` : `/${locale}/category/${categoryId}`)
    }
  }

  const handleSubcategoryClick = (
    categoryId: string,
    subcategoryId: string,
    categoryName: string,
    subcategoryName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    router.push(`/${locale}/category/${categoryId}/subcategory/${subcategoryId}`)
  }

  const CategoryList = () => (
    <>
      <SidebarHeader>
        <div className="relative flex-1">
          <Search className={cn(
            "absolute top-2.5 h-4 w-4 text-light-grey",
            isRTL ? "right-2" : "left-2"
          )} />
          <Input
            placeholder={locale === "ar" ? "البحث في الفئات..." : "Search categories..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "bg-light-white dark:bg-dark border-light-grey-light dark:border-dark-grey",
              "text-dark dark:text-white-pure placeholder:text-light-grey w-full",
              isRTL ? "pr-8" : "pl-8"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {isLoading ? (
            <SidebarSkeleton locale={locale} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-sm text-light-grey">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-accent-purple hover:text-accent-purple-dark"
                onClick={() => {
                  setSearchQuery("")
                  setError(null)
                }}
              >
                {locale === "ar" ? "حاول مرة أخرى" : "Try Again"}
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-sm text-light-grey">
                {locale === "ar" ? "لا توجد فئات متاحة" : "No categories available"}
              </p>
            </div>
          ) : (
            <SidebarGroup>
              <CategoryItems />
            </SidebarGroup>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-light-grey hover:text-accent-purple",
            isRTL && "rotate-180"
          )}
        >
          {isRTL ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </SidebarFooter>
    </>
  )

  const CategoryItems = () => (
    <>
      <div className="px-4 py-2">
        <h3 className="text-sm font-medium text-light-grey">
          {locale === "ar" ? "الفئات" : "Categories"}
        </h3>
      </div>
      <Button
        variant={activeCategory === null ? "secondary" : "ghost"}
        className={cn(
          "w-full",
          isRTL ? "justify-end" : "justify-start",
          activeCategory === null && "bg-muted"
        )}
        onClick={() => handleCategoryClick(null)}
      >
        <div className={cn(
          "flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5">
            <Search className="h-4 w-4" />
          </span>
          <span>{locale === "ar" ? "جميع الفئات" : "All Categories"}</span>
        </div>
      </Button>

      {categories.map((category) => (
        <Fragment key={category.id}>
          <Button
            variant={activeCategory === category.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between",
              isRTL && "flex-row-reverse",
              activeCategory === category.id && "bg-muted"
            )}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              {category.iconName && (
                <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5">
                  {renderCategoryIcon(category.iconName)}
                </span>
              )}
              <span>{locale === "ar" ? category.nameAr : category.nameEn}</span>
            </div>
            {(category.subcategories?.length ?? 0) > 0 && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  activeCategory === category.id && "rotate-180",
                  isRTL && activeCategory !== category.id && "rotate-180",
                  isRTL && activeCategory === category.id && "rotate-0"
                )}
              />
            )}
          </Button>

          {activeCategory === category.id && (category.subcategories?.length ?? 0) > 0 && (
            <div className={cn(
              isRTL ? "mr-4 ml-0" : "ml-4 mr-0"
            )}>
              {category.subcategories?.map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={(e) =>
                    handleSubcategoryClick(
                      category.id,
                      subcategory.id,
                      locale === "ar" ? category.nameAr : category.nameEn,
                      locale === "ar" ? subcategory.nameAr : subcategory.nameEn,
                      e
                    )
                  }
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse"
                  )}>
                    {subcategory.iconName && (
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5">
                        {renderCategoryIcon(subcategory.iconName)}
                      </span>
                    )}
                    <span>{locale === "ar" ? subcategory.nameAr : subcategory.nameEn}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </Fragment>
      ))}
    </>
  )

  return (
    <>
      <Sidebar className={cn("hidden lg:flex", className)} direction={isRTL ? "rtl" : "ltr"}>
        <CategoryList />
      </Sidebar>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side={isRTL ? "right" : "left"} className="p-0">
          <SheetHeader className="px-4 py-2">
            <h2 className="text-lg font-semibold">
              {locale === "ar" ? "الفئات" : "Categories"}
            </h2>
          </SheetHeader>
          <CategoryList />
        </SheetContent>
      </Sheet>
    </>
  )
}
