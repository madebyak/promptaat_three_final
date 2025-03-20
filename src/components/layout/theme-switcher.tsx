'use client';

import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="dark:hover:bg-dark hover:bg-light-grey-light"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-white-pure" />
      ) : (
        <Moon className="h-5 w-5 text-dark" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
