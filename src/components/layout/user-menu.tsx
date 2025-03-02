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
import { User, Settings, FileText, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { routes } from '@/lib/routes'
import { DefaultAvatar } from '@/components/ui/default-avatar'

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  locale: string
}

export function UserMenu({ user, locale }: UserMenuProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: `/${locale}/auth/login` });
  };

  if (!user?.name || !user?.email) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild className="text-sm">
          <Link href={`/${locale}/auth/login`}>Sign In</Link>
        </Button>
        <Button asChild className="text-sm bg-accent-purple hover:bg-accent-purple/90">
          <Link href={`/${locale}/auth/register`} className="text-white-pure">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 overflow-hidden"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              className="h-full w-full object-cover"
              width={36}
              height={36}
              priority
            />
          ) : (
            <DefaultAvatar name={user.name} />
          )}
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
              <User className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
          </Link>
          <Link href={`/${locale}/my-prompts`}>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>My Prompts</span>
            </DropdownMenuItem>
          </Link>
          <Link href={`/${locale}/settings`}>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 cursor-pointer"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
