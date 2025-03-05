'use client';

import React from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { cn } from '@/lib/utils'
import QueryProvider from '@/providers/query-provider'
import { usePathname } from 'next/navigation'
import { useSession, SessionProvider } from 'next-auth/react'
import { VerificationBanner } from '@/components/auth/verification-banner'
import { UserAccountLayout } from '@/components/layout/user-account-layout'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = React.use(params);
  const pathname = usePathname();
  
  // Improved auth route detection - check for exact path pattern
  const isAuthRoute = pathname?.startsWith(`/${locale}/auth/`);
  const isUserAccountRoute = pathname?.includes(`/${locale}/profile`) || 
                           pathname?.includes(`/${locale}/my-prompts`) || 
                           pathname?.includes(`/${locale}/settings`);
  const defaultDirection = locale === 'ar' ? 'rtl' : 'ltr'
  const isRTL = locale === 'ar'
  
  return (
    <SessionProvider>
      <ThemeProvider defaultDirection={defaultDirection}>
        <QueryProvider>
          <div className="relative min-h-screen bg-white-pure dark:bg-black-main">
            {!isAuthRoute && (
              <MainLayout
                locale={locale}
                isRTL={isRTL}
                isUserAccountRoute={isUserAccountRoute}
              >
                {children}
              </MainLayout>
            )}
            {isAuthRoute && children}
          </div>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

// Main layout component with session handling
export function MainLayout({ 
  children, 
  locale,
  isRTL,
  isUserAccountRoute
}: { 
  children: React.ReactNode 
  locale: string
  isRTL: boolean
  isUserAccountRoute: boolean
}) {
  const { data: session } = useSession();
  // Check if the user is logged in but hasn't verified their email
  // Remove the emailVerified check as it's not in the default user type
  const needsVerification = false; // Disable verification check for now
  
  return (
    <>
      <Navbar locale={locale} user={session?.user} />
      {needsVerification && session?.user?.email && (
        <VerificationBanner email={session.user.email} locale={locale} />
      )}
      
      {isUserAccountRoute ? (
        <UserAccountLayout locale={locale} isRTL={isRTL}>
          {children}
        </UserAccountLayout>
      ) : (
        <div className="flex min-h-[calc(100vh-64px)]">
          <AppSidebar locale={locale} />
          <main className={cn(
            "flex-1",
            isRTL ? "md:mr-64" : "md:ml-64"
          )}>
            {children}
          </main>
        </div>
      )}
    </>
  );
}
