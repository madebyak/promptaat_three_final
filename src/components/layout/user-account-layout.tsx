'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { UserSidebar } from './user-sidebar'
import { useSession } from 'next-auth/react'
import { VerificationBanner } from '@/components/auth/verification-banner'

interface UserAccountLayoutProps {
  children: React.ReactNode
  locale: string
  isRTL: boolean
}

export function UserAccountLayout({ children, locale, isRTL }: UserAccountLayoutProps) {
  const { data: session } = useSession()
  
  // Check if the user is logged in but hasn't verified their email
  const needsVerification = session?.user && session.user.email && session.user.emailVerified === false
  
  return (
    <>
      {needsVerification && session?.user?.email && (
        <VerificationBanner email={session.user.email} locale={locale} />
      )}
      <div className="flex min-h-[calc(100vh-64px)]">
        <UserSidebar locale={locale} user={session?.user} />
        <main className={cn(
          "flex-1",
          isRTL ? "md:mr-64" : "md:ml-64"
        )}>
          {children}
        </main>
      </div>
    </>
  )
}
