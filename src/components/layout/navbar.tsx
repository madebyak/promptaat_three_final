'use client'

import { useTheme } from '@/components/providers/theme-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './mobile-menu'
import { LanguageSwitcher } from './language-switcher'
import { UserMenu } from './user-menu'
import { Sun, Moon, Crown } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

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
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-light-grey-light dark:border-dark-grey bg-white-pure dark:bg-black-main">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex h-16 items-center">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <div className="flex items-center">
              <Logo />
            </div>
          </div>

          {/* Right section: Navigation + Actions */}
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="hidden md:flex items-center gap-4">
              {/* Pricing Link */}
              <Link 
                href={`/${locale}/pricing`} 
                className="text-sm font-medium text-black-main dark:text-white-pure hover:bg-accent-purple/10 hover:text-accent-purple dark:hover:text-accent-purple px-3 py-2 rounded-md transition-all duration-200 ease-in-out"
              >
                {locale === 'ar' ? 'الأسعار' : 'Pricing'}
              </Link>
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
              
              {/* Pro Badge - Only show if user is subscribed */}
              {user?.isSubscribed && (
                <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </div>
              )}
              
              <UserMenu user={user} locale={locale} />
            </div>
            <MobileMenu user={user} locale={locale} />
          </div>
        </div>
      </div>
    </header>
  )
}
