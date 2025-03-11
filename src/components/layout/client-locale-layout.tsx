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
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl'

export function ClientLocaleLayout({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode
  locale: string
  messages: AbstractIntlMessages
}) {
  const pathname = usePathname();
  
  // Improved auth route detection - check for exact path pattern
  const isAuthRoute = pathname?.startsWith(`/${locale}/auth/`);
  const isUserAccountRoute = pathname?.includes(`/${locale}/profile`) || 
                           pathname?.includes(`/${locale}/my-prompts`) || 
                           pathname?.includes(`/${locale}/settings`);
  const defaultDirection = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';
  
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
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
      </NextIntlClientProvider>
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
  const { data: session, status } = useSession();
  // Check if the user is logged in but hasn't verified their email
  const needsVerification = session?.user?.emailVerified === false;
  
  // Add a check for protected routes with a delay to ensure session is fully loaded
  React.useEffect(() => {
    // Only redirect if explicitly unauthenticated (not loading) and on a protected route
    if (isUserAccountRoute && status === 'unauthenticated') {
      // Add debug logging
      console.log('MainLayout: Session status is unauthenticated, redirecting to login');
      
      // Use setTimeout to give the session a chance to load
      const timer = setTimeout(() => {
        // Double-check status before redirecting
        if (status === 'unauthenticated') {
          window.location.href = `/${locale}/auth/login`;
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isUserAccountRoute, status, locale]);
  
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
        <div className={cn(
          "flex min-h-[calc(100vh-64px)]",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <AppSidebar locale={locale} className={isRTL ? "right-0" : "left-0"} />
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
