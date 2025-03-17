'use client';

import React, { useEffect } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Navbar } from '@/components/layout/navbar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { cn } from '@/lib/utils'
import QueryProvider from '@/providers/query-provider'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, SessionProvider } from 'next-auth/react'
import { VerificationBanner } from '@/components/auth/verification-banner'
import { UserAccountLayout } from '@/components/layout/user-account-layout'
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl'
import { SEOProvider } from '@/components/seo/seo-provider'

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
  const isPricingRoute = pathname === `/${locale}/pricing`;
  const isUserAccountRoute = pathname?.includes(`/${locale}/profile`) || 
                           pathname?.includes(`/${locale}/my-prompts`) || 
                           pathname?.includes(`/${locale}/settings`) ||
                           pathname?.includes(`/${locale}/subscription`);
  const defaultDirection = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';
  
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider defaultDirection={defaultDirection}>
          <QueryProvider>
            <SEOProvider locale={locale}>
              <div className="relative min-h-screen bg-white-pure dark:bg-black-main">
                {!isAuthRoute && !isPricingRoute && (
                  <MainLayout
                    locale={locale}
                    isRTL={isRTL}
                    isUserAccountRoute={isUserAccountRoute}
                  >
                    {children}
                  </MainLayout>
                )}
                {(isAuthRoute || isPricingRoute) && children}
              </div>
            </SEOProvider>
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
  const pathname = usePathname();
  const router = useRouter();
  const needsVerification = session?.user?.emailVerified === false;
  
  // Debug logging
  console.log('Current pathname:', pathname);
  console.log('Is pricing route:', pathname === `/${locale}/pricing`);
  
  useEffect(() => {
    if (isUserAccountRoute && status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
    }
  }, [isUserAccountRoute, status, locale, router]);
  
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
      ) : pathname === `/${locale}/pricing` ? (
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      ) : (
        <div className={cn(
          "flex min-h-[calc(100vh-64px)]",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <AppSidebar locale={locale} className={isRTL ? "right-0" : "left-0"} />
          <main className={cn(
            "flex-1",
            isRTL ? "md:mr-64" : "md:ml-64",
            "lg:pt-0 pt-12"
          )}>
            {children}
          </main>
        </div>
      )}
    </>
  );
}
