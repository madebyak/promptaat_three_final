'use client'

import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { UserSidebar } from './user-sidebar'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { VerificationBanner } from '@/components/auth/verification-banner'

interface UserAccountLayoutProps {
  children: React.ReactNode
  locale: string
  isRTL: boolean
}

export function UserAccountLayout({ children, locale, isRTL }: UserAccountLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Check if the user is logged in but hasn't verified their email
  const needsVerification = session?.user && session.user.email && !session.user.emailVerified
  
  // Only redirect if explicitly unauthenticated and not loading
  useEffect(() => {
    // Add a small delay to allow the session to be fully loaded
    const timer = setTimeout(() => {
      if (status === 'unauthenticated') {
        console.log('UserAccountLayout: Redirecting to login page - unauthenticated');
        router.push(`/${locale}/auth/login`);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [status, router, locale])
  
  // Show loading state while session is being determined
  if (status === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render content if authenticated
  if (session?.user) {
    return (
      <>
        {needsVerification && session.user.email && (
          <VerificationBanner email={session.user.email} locale={locale} />
        )}
        <div className="flex min-h-[calc(100vh-64px)]">
          <UserSidebar locale={locale} user={session.user} />
          <main className={cn(
            "flex-1",
            isRTL ? "md:mr-64" : "md:ml-64"
          )}>
            {children}
          </main>
        </div>
      </>
    );
  }
  
  // This should not be rendered as the useEffect should redirect, but as a fallback
  return null
}
