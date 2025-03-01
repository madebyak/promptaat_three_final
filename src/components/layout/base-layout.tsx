'use client'

import { cn } from '@/lib/utils'

interface BaseLayoutProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function BaseLayout({ children, className, fullWidth }: BaseLayoutProps) {
  if (fullWidth) {
    return (
      <div className={cn(
        "relative left-0 right-0 w-[100vw]",
        "mr-[calc(-50vw+50%)] ml-[calc(-50vw+50%)]",
        className
      )}>
        <div className="mx-auto w-full max-w-[1400px] px-6">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "mx-auto w-full max-w-[1400px] px-6",
      className
    )}>
      {children}
    </div>
  )
}
