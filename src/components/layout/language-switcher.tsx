'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"

interface LanguageSwitcherProps {
  locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (newLocale: string) => {
    // Only switch if the locale is different
    if (newLocale === locale) return
    
    // Handle the path conversion correctly
    const segments = pathname.split('/')
    
    // Replace the locale segment (should be the first segment after the leading slash)
    if (segments.length > 1) {
      segments[1] = newLocale
      const newPath = segments.join('/')
      console.log(`Switching language from ${locale} to ${newLocale}, new path: ${newPath}`)
      router.push(newPath)
    } else {
      // Fallback for unexpected path structure
      console.log(`Unexpected path structure, redirecting to /${newLocale}`)
      router.push(`/${newLocale}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-light-grey-light dark:border-0 dark:bg-black-main dark:text-white-pure hover:bg-light-grey-light dark:hover:bg-dark"
        >
          {locale === 'ar' ? 'ع' : 'EN'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white-pure dark:bg-dark">
        <DropdownMenuItem onClick={() => switchLanguage('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLanguage('ar')}>
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
