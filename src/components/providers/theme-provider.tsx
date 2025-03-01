'use client';

import { createContext, useContext, useEffect } from 'react';
import { useThemeStore } from '@/hooks/use-theme-store';

type Theme = 'dark' | 'light';
type Direction = 'ltr' | 'rtl';

interface ThemeContextType {
  theme: Theme;
  direction: Direction;
  setTheme: (theme: Theme) => void;
  setDirection: (dir: Direction) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultDirection = 'ltr',
}: {
  children: React.ReactNode;
  defaultDirection?: Direction;
}) {
  const { theme, setTheme, direction, setDirection } = useThemeStore();

  // Initialize direction from props if provided
  useEffect(() => {
    if (defaultDirection && defaultDirection !== direction) {
      setDirection(defaultDirection);
    }
  }, [defaultDirection, direction, setDirection]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply direction
    root.dir = direction;
  }, [theme, direction]);

  const value = {
    theme,
    direction,
    setTheme,
    setDirection,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
