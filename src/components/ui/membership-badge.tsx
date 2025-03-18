'use client'

import React from 'react'
import { Turtle, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MembershipBadgeProps {
  type: 'basic' | 'pro'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export function MembershipBadge({ type, size = 'md', className }: MembershipBadgeProps) {
  const iconSizes = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const badgeSizes = {
    xs: 'px-1 py-0.5 gap-0.5',
    sm: 'px-1.5 py-0.5 gap-1',
    md: 'px-2 py-1 gap-1.5',
    lg: 'px-3 py-1.5 gap-2',
  }

  if (type === 'basic') {
    return (
      <div 
        className={cn(
          "rounded-full inline-flex items-center justify-center",
          "bg-mid-grey text-light-grey-light dark:bg-mid-grey dark:text-light-grey-light",
          badgeSizes[size],
          className
        )}
      >
        <Turtle className={iconSizes[size]} />
        <span className={cn("font-bold", textSizes[size])}>BASIC</span>
      </div>
    )
  }

  // Pro badge with rich gradient background and hover animation
  return (
    <div 
      className={cn(
        "rounded-full inline-flex items-center justify-center",
        "text-white font-bold",
        "pro-badge-gradient shadow-sm",
        "transition-all duration-300 ease-in-out",
        badgeSizes[size],
        className
      )}
      style={{
        backgroundSize: '300%',
        backgroundPosition: 'left center',
        textShadow: '1px 1px 2px rgba(68, 14, 216, 0.5)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundSize = '320%';
        e.currentTarget.style.backgroundPosition = 'right center';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundSize = '300%';
        e.currentTarget.style.backgroundPosition = 'left center';
      }}
    >
      <Crown className={cn(iconSizes[size], "transition-all duration-300")} />
      <span className={cn("font-bold", textSizes[size])}>PRO</span>
    </div>
  )
}
