'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, FileText, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DefaultAvatar } from '@/components/ui/default-avatar'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface UserSidebarProps {
  locale: string
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  className?: string
}

interface MenuItemProps {
  icon: React.ElementType
  label: string
  href: string
  active: boolean
  onClick?: () => void
}

const MenuItem = ({ icon: Icon, label, href, active, onClick }: MenuItemProps) => (
  <Link 
    href={href} 
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
      active 
        ? "bg-accent-purple/10 text-accent-purple" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
    onClick={onClick}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </Link>
)

export function UserSidebar({ locale, user, className }: UserSidebarProps) {
  const pathname = usePathname()
  const isRTL = locale === 'ar'
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: `/${locale}/auth/login` })
  }

  const menuItems = [
    {
      icon: User,
      label: locale === 'ar' ? 'ملفي الشخصي' : 'My Account',
      href: `/${locale}/profile`,
      active: pathname === `/${locale}/profile`
    },
    {
      icon: FileText,
      label: locale === 'ar' ? 'بروماتي' : 'My Prompts',
      href: `/${locale}/my-prompts`,
      active: pathname === `/${locale}/my-prompts`
    },
    {
      icon: Settings,
      label: locale === 'ar' ? 'الإعدادات' : 'Settings',
      href: `/${locale}/settings`,
      active: pathname === `/${locale}/settings`
    }
  ]

  return (
    <Sidebar 
      direction={isRTL ? 'rtl' : 'ltr'} 
      className={cn("border-light-grey-light dark:border-dark-grey", className)}
      collapsible={false}
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2">
          {user?.image ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name || ''} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          ) : (
            <DefaultAvatar name={user?.name || ''} className="h-10 w-10" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user?.email || ''}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="space-y-1 p-2">
            {menuItems.map((item) => (
              <MenuItem 
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={item.active}
              />
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : locale === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
