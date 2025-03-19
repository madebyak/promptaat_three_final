import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  className?: string
}

export function PageHeader({
  title,
  description,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-lg md:text-xl">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
