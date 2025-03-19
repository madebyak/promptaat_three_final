import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn('container mx-auto px-4 md:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}
