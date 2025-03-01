import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type Direction = 'ltr' | 'rtl'

interface ThemeStore {
  theme: Theme
  direction: Direction
  setTheme: (theme: Theme) => void
  setDirection: (direction: Direction) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      direction: 'ltr',
      setTheme: (theme) => set({ theme }),
      setDirection: (direction) => set({ direction }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
