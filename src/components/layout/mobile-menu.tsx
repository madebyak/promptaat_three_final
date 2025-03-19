'use client'

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, User, FileText, Settings, LogOut, Sun, Moon, Crown, ChevronDown, ChevronUp } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { useTheme } from "@/components/providers/theme-provider"
import { MembershipBadge } from "@/components/ui/membership-badge"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  locale: string
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    isSubscribed?: boolean
  }
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
    href: "/company/blog",
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

export function MobileMenu({ locale, user }: MobileMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const isRTL = locale === 'ar';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  // Function to get localized content
  const getLocalizedContent = (content: { en: string, ar: string }) => {
    return locale === 'ar' ? content.ar : content.en
  }

  // Function to safely get localized content with null check
  const safeGetLocalizedContent = (content?: { en: string, ar: string }) => {
    if (!content) return '';
    return locale === 'ar' ? content.ar : content.en
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:hidden border-light-grey-light hover:bg-light-grey-light dark:border-dark-grey dark:hover:bg-dark-grey"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] bg-white-pure dark:bg-black-main">
        <nav className="flex flex-col gap-4 mt-8">
          <Button variant="ghost" asChild className="justify-start">
            <Link href={`/${locale}`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
          </Button>
          
          {/* Pricing Link */}
          <Button variant="ghost" asChild className="justify-start">
            <Link href={`/${locale}/pricing`} className="text-sm text-black-main dark:text-white-pure hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple rounded-md transition-all duration-200 ease-in-out">
              {locale === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
          </Button>
          
          {/* Resources Dropdown */}
          <div className="flex flex-col">
            <Button 
              variant="ghost" 
              className={cn(
                "justify-between text-sm text-black-main dark:text-white-pure hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple rounded-md transition-all duration-200 ease-in-out",
                resourcesOpen && "bg-accent-purple/10 text-accent-purple"
              )}
              onClick={() => setResourcesOpen(!resourcesOpen)}
            >
              <span>{locale === 'ar' ? 'الموارد' : 'Resources'}</span>
              {resourcesOpen ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
            
            {resourcesOpen && (
              <div className="pl-4 mt-2 flex flex-col gap-2">
                {resourcesItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className={cn(
                      "text-sm py-2 px-3 rounded-md hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple",
                      isRTL ? "text-right" : "text-left"
                    )}
                  >
                    <div className="font-medium">{getLocalizedContent(item.title)}</div>
                    {item.description && (
                      <div className="text-xs text-light-grey dark:text-light-grey-low mt-1">
                        {safeGetLocalizedContent(item.description)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Company Dropdown */}
          <div className="flex flex-col">
            <Button 
              variant="ghost" 
              className={cn(
                "justify-between text-sm text-black-main dark:text-white-pure hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple rounded-md transition-all duration-200 ease-in-out",
                companyOpen && "bg-accent-purple/10 text-accent-purple"
              )}
              onClick={() => setCompanyOpen(!companyOpen)}
            >
              <span>{locale === 'ar' ? 'الشركة' : 'Company'}</span>
              {companyOpen ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
            
            {companyOpen && (
              <div className="pl-4 mt-2 flex flex-col gap-2">
                {companyItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className={cn(
                      "text-sm py-2 px-3 rounded-md hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple",
                      isRTL ? "text-right" : "text-left"
                    )}
                  >
                    <div className="font-medium">{getLocalizedContent(item.title)}</div>
                    {item.description && (
                      <div className="text-xs text-light-grey dark:text-light-grey-low mt-1">
                        {safeGetLocalizedContent(item.description)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <hr className="border-light-grey-light dark:border-dark-grey my-4" />
          
          {/* Language and Theme Controls */}
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 text-dark dark:text-white-pure">
                {locale === 'ar' ? 'اللغة' : 'Language'}:
              </span>
              <LanguageSwitcher locale={locale} />
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 text-dark dark:text-white-pure">
                {locale === 'ar' ? 'المظهر' : 'Theme'}:
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="h-9 w-9 border-light-grey-light hover:bg-light-grey-light dark:border-dark-grey dark:hover:bg-dark-grey"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {locale === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}
                </span>
              </Button>
            </div>
          </div>
          
          <hr className="border-light-grey-light dark:border-dark-grey my-2" />
          
          <div className="flex flex-col gap-4">
            {user ? (
              // Show user-specific options when logged in
              <>
                {/* User info section */}
                {user.name && (
                  <div className="px-3 py-2 bg-light-grey-light/20 dark:bg-dark-grey/20 rounded-md">
                    <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                      {/* Badge displayed outside user info */}
                      {user.isSubscribed ? (
                        <MembershipBadge type="pro" size="sm" />
                      ) : (
                        <MembershipBadge type="basic" size="sm" />
                      )}
                      <span className="text-sm font-medium text-dark dark:text-white-pure">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-xs text-light-grey">
                      {user.email}
                    </span>
                  </div>
                )}
                
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/profile`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <User className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                    <span>{locale === 'ar' ? 'ملفي الشخصي' : 'My Account'}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/my-prompts`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <FileText className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                    <span>{locale === 'ar' ? 'موجهاتي' : 'My Prompts'}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/subscription`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <Crown className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                    <span>{locale === 'ar' ? 'اشتراكي' : 'My Subscription'}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/settings`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <Settings className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                    <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                  <span>{isSigningOut ? 'Signing out...' : locale === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
                </Button>
              </>
            ) : (
              // Show login/register options when not logged in
              <>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/${locale}/auth/login`} className="text-sm">
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full bg-accent-purple hover:bg-accent-purple/90">
                  <Link href={`/${locale}/auth/register`} className="text-sm text-white-pure">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
