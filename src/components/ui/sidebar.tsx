'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'ltr' | 'rtl'
  collapsible?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

interface SidebarContextValue {
  collapsed: boolean
  direction: 'ltr' | 'rtl'
  onCollapse: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a Sidebar')
  }
  return context
}

export function Sidebar({
  children,
  direction = 'ltr',
  collapsible = true,
  collapsed = false,
  onCollapse,
  className,
  ...props
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed)

  const handleCollapse = React.useCallback((value: boolean) => {
    setIsCollapsed(value)
    onCollapse?.(value)
  }, [onCollapse])

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, direction, onCollapse: handleCollapse }}>
      <aside
        className={cn(
          'fixed top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col',
          'border-light-grey-light bg-white-pure transition-all duration-300',
          'dark:border-dark-grey dark:bg-black-main',
          direction === 'rtl' ? 'right-0 border-l rtl' : 'left-0 border-r ltr',
          isCollapsed && (direction === 'rtl' 
            ? '-translate-x-48 transform' 
            : 'translate-x-48 transform'
          ),
          className
        )}
        dir={direction}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  )
}

export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-14 items-center border-b border-light-grey-light px-4 dark:border-dark-grey',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { direction } = useSidebar()
  
  return (
    <div
      className={cn(
        'flex-1 overflow-auto',
        direction === 'rtl' ? 'ml-0 mr-0' : 'ml-0 mr-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 p-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarItem({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { direction } = useSidebar()
  
  return (
    <button
      className={cn(
        'group flex w-full items-center rounded-md px-2 py-2 text-sm',
        'hover:bg-light-grey-light dark:hover:bg-dark-grey',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple',
        'disabled:pointer-events-none disabled:opacity-50',
        direction === 'rtl' ? 'text-right' : 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-auto flex items-center gap-4 p-4 border-t border-light-grey-light dark:border-dark-grey',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
