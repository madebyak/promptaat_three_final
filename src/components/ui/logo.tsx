'use client';

import { useTheme } from '@/components/providers/theme-provider';
import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Link href="/" className={className}>
      <Image
        src={isDark ? '/Promptaat_logo_white.svg' : '/Promptaat_logo_black.svg'}
        alt="Promptaat Logo"
        width={120}
        height={32}
        className="dark:invert"
      />
    </Link>
  );
}
