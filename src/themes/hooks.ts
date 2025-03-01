'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { type Theme } from './types'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  
  return {
    theme: theme as Theme,
    setTheme,
    systemTheme: systemTheme as Theme | undefined,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
  }
}
