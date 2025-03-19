'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { LanguageSwitcher } from './language-switcher'
import { UserMenu } from './user-menu'
import { Sun, Moon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { MainNavigationMenu } from './main-navigation-menu'
import { cn } from '@/lib/utils'

interface NavbarProps {
  locale?: string
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    isSubscribed?: boolean
  }
}

export function Navbar({ locale = 'en', user }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  const isRTL = locale === 'ar'
  
  // Vertical separator component for reuse
  const VerticalSeparator = ({ className }: { className?: string }) => (
    <div className={cn("hidden md:flex items-center h-9 mx-4", className)}>
      <div className="h-9 w-[1px] bg-gray-300 dark:bg-gray-600"></div>
    </div>
  )
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-grey-light dark:border-dark-grey bg-white-pure dark:bg-black-main">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex h-16 items-center">
          {/* Left section: Logo */}
          <div className={cn("flex items-center", isRTL && "order-1")}>
            <div className="flex items-center">
              <Logo />
            </div>
          </div>
          
          {/* Right section with navigation and controls */}
          <div className={cn("flex items-center ml-auto", isRTL && "order-2 ml-0 mr-auto")}>
            {/* Navigation Menu (desktop only) */}
            <div className={cn("hidden md:flex items-center", isRTL && "order-1")}>
              <MainNavigationMenu locale={locale} />
            </div>
            
            {/* First vertical separator */}
            <VerticalSeparator className={cn(isRTL && "order-2")} />
            
            {/* Language and theme controls */}
            <div className={cn("hidden md:flex items-center gap-4", isRTL && "order-3")}>
              <LanguageSwitcher locale={locale} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
            
            {/* Second vertical separator */}
            <VerticalSeparator className={cn(isRTL && "order-4")} />
            
            {/* User menu / Sign in buttons */}
            <div className={cn("hidden md:flex items-center", isRTL && "order-5")}>
              <UserMenu user={user} locale={locale} />
            </div>
            
            {/* Mobile menu button (only visible on mobile) */}
            <div className={cn("md:hidden", isRTL && "order-6")}>
              <MobileMenu user={user} locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
