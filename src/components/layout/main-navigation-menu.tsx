'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface MainNavigationMenuProps {
  locale: string
}

// Define the structure for our navigation items
interface NavItem {
  title: {
    en: string
    ar: string
  }
  description?: {
    en: string
    ar: string
  }
  href: string
}

// Resources dropdown items
const resourcesItems: NavItem[] = [
  {
    title: { en: "Docs", ar: "الوثائق" },
    description: { 
      en: "Detailed guides and documentation", 
      ar: "أدلة وتوثيق مفصلة" 
    },
    href: "/resources/docs",
  },
  {
    title: { en: "Benchmark", ar: "المقارنة المرجعية" },
    description: { 
      en: "Performance metrics and comparisons", 
      ar: "مقاييس الأداء والمقارنات" 
    },
    href: "/resources/benchmark",
  },
  {
    title: { en: "Feature Requests", ar: "طلبات الميزات" },
    description: { 
      en: "Request new features and improvements", 
      ar: "طلب ميزات وتحسينات جديدة" 
    },
    href: "/resources/feature-requests",
  },
  {
    title: { en: "Change Log", ar: "سجل التغييرات" },
    description: { 
      en: "Latest updates and changes", 
      ar: "آخر التحديثات والتغييرات" 
    },
    href: "/resources/changelog",
  },
  {
    title: { en: "FAQ", ar: "الأسئلة الشائعة" },
    description: { 
      en: "Frequently asked questions", 
      ar: "الأسئلة المتداولة" 
    },
    href: "/resources/faq",
  },
]

// Company dropdown items
const companyItems: NavItem[] = [
  {
    title: { en: "About Us", ar: "من نحن" },
    description: { 
      en: "Learn about our mission and vision", 
      ar: "تعرف على مهمتنا ورؤيتنا" 
    },
    href: "/company/about-us",
  },
  {
    title: { en: "Partnership", ar: "الشراكة" },
    description: { 
      en: "Collaborate with us", 
      ar: "تعاون معنا" 
    },
    href: "/company/partnership",
  },
  {
    title: { en: "Blog", ar: "المدونة" },
    description: { 
      en: "Latest articles and news", 
      ar: "أحدث المقالات والأخبار" 
    },
    href: "/blog",
  },
  {
    title: { en: "Contact", ar: "اتصل بنا" },
    description: { 
      en: "Get in touch with our team", 
      ar: "تواصل مع فريقنا" 
    },
    href: "/company/contact",
  },
]

export function MainNavigationMenu({ locale }: MainNavigationMenuProps) {
  const pathname = usePathname()
  const isRTL = locale === 'ar'
  
  // Function to check if a link is active
  const isActive = (href: string) => {
    return pathname.includes(href)
  }

  // Function to get localized content
  const getLocalizedContent = (content: { en: string, ar: string }) => {
    return locale === 'ar' ? content.ar : content.en
  }

  return (
    <NavigationMenu className={cn("hidden md:flex", isRTL && "flex-row-reverse")}>
      <NavigationMenuList className={isRTL ? "flex-row-reverse" : ""}>
        {/* Pricing (direct link) */}
        <NavigationMenuItem>
          <Link href={`/${locale}/pricing`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {locale === 'ar' ? 'الأسعار' : 'Pricing'}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Resources Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/resources') ? "bg-accent-purple/10 text-accent-purple" : ""}>
            {locale === 'ar' ? 'الموارد' : 'Resources'}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className={cn(
              "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
              isRTL && "rtl"
            )}>
              {resourcesItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={getLocalizedContent(item.title)}
                  href={`/${locale}${item.href}`}
                  description={item.description ? getLocalizedContent(item.description) : undefined}
                  isRTL={isRTL}
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Company Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive('/company') ? "bg-accent-purple/10 text-accent-purple" : ""}>
            {locale === 'ar' ? 'الشركة' : 'Company'}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className={cn(
              "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
              isRTL && "rtl"
            )}>
              {companyItems.map((item) => (
                <ListItem
                  key={item.href}
                  title={getLocalizedContent(item.title)}
                  href={`/${locale}${item.href}`}
                  description={item.description ? getLocalizedContent(item.description) : undefined}
                  isRTL={isRTL}
                />
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

// Custom ListItem component for dropdown items
interface ListItemProps {
  title: string
  href: string
  description?: string
  isRTL?: boolean
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & ListItemProps
>(({ className, title, href, description, isRTL, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent-purple/10 hover:text-accent-purple focus:bg-accent-purple/10 focus:text-accent-purple",
            className
          )}
          {...props}
        >
          <div className={cn("text-sm font-medium leading-none", isRTL && "text-right")}>
            {title}
          </div>
          {description && (
            <p className={cn(
              "line-clamp-2 text-sm leading-snug text-light-grey dark:text-light-grey-low",
              isRTL && "text-right"
            )}>
              {description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
