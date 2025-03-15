'use client'

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, User, FileText, Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface MobileMenuProps {
  locale: string
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function MobileMenu({ locale, user }: MobileMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

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
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild className="justify-start">
            <Link href={`/${locale}/pricing`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
              {locale === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
          </Button>
          <Button variant="ghost" asChild className="justify-start">
            <Link href={`/${locale}/about`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
              About
            </Link>
          </Button>
          <Button variant="ghost" asChild className="justify-start">
            <Link href={`/${locale}/help`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
              Help
            </Link>
          </Button>
          <hr className="border-light-grey-light dark:border-dark-grey my-4" />
          <div className="flex flex-col gap-4">
            {user ? (
              // Show user-specific options when logged in
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/profile`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <User className="mr-2 h-4 w-4" />
                    <span>{locale === 'ar' ? 'ملفي الشخصي' : 'My Account'}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/my-prompts`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>{locale === 'ar' ? 'بروماتي' : 'My Prompts'}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link href={`/${locale}/settings`} className="text-sm text-dark hover:text-accent-purple dark:text-white-pure dark:hover:text-accent-purple">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
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
