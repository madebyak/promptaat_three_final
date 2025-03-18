'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, FileText, LogOut, Crown, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { DefaultAvatar } from '@/components/ui/default-avatar'
import { cn } from '@/lib/utils'
import { MembershipBadge } from '@/components/ui/membership-badge'

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    isSubscribed?: boolean
  }
  locale: string
}

export function UserMenu({ user, locale }: UserMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isRTL = locale === 'ar';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  // Extract first name from the full name
  const getFirstName = (fullName: string | null | undefined): string => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  const firstName = getFirstName(user?.name);

  if (!user?.name || !user?.email) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild className="text-sm">
          <Link href={`/${locale}/auth/login`}>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Link>
        </Button>
        <Button asChild className="text-sm bg-accent-purple hover:bg-accent-purple/90">
          <Link href={`/${locale}/auth/register`} className="text-white-pure">{isRTL ? 'إنشاء حساب' : 'Sign Up'}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
      {/* Badge displayed outside the dropdown */}
      {user.isSubscribed ? (
        <MembershipBadge type="pro" size="sm" />
      ) : (
        <MembershipBadge type="basic" size="sm" />
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent/80 transition-colors",
              isRTL && "flex-row-reverse"
            )}
          >
            <div className="h-8 w-8 rounded-full overflow-hidden">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  width={32}
                  height={32}
                  priority
                />
              ) : (
                <DefaultAvatar name={user.name} />
              )}
            </div>
            <span className="text-sm font-medium">{firstName}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-light-grey">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={`/${locale}/profile`}>
              <DropdownMenuItem>
                <User className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                <span>{isRTL ? 'حسابي' : 'My Account'}</span>
              </DropdownMenuItem>
            </Link>
            <Link href={`/${locale}/my-prompts`}>
              <DropdownMenuItem>
                <FileText className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                <span>{isRTL ? 'موجهاتي' : 'My Prompts'}</span>
              </DropdownMenuItem>
            </Link>
            <Link href={`/${locale}/subscription`}>
              <DropdownMenuItem>
                <Crown className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                <span>{isRTL ? 'اشتراكي' : 'My Subscription'}</span>
              </DropdownMenuItem>
            </Link>
            <Link href={`/${locale}/settings`}>
              <DropdownMenuItem>
                <Settings className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
                <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 cursor-pointer"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className={cn("mr-2 h-4 w-4", isRTL && "ml-2 mr-0")} />
            <span>{isSigningOut ? (isRTL ? 'جاري تسجيل الخروج...' : 'Signing out...') : (isRTL ? 'تسجيل الخروج' : 'Log out')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
