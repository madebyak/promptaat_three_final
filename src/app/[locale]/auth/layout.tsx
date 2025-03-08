"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';
import { Logo } from '@/components/ui/logo';
import { useParams } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  const params = useParams();
  const locale = params.locale as string;
  const isRtl = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-light-white dark:bg-dark">
      {/* Header with Logo and Controls */}
      <header className="flex justify-between items-center px-4 sm:px-6 h-16 border-b bg-white-pure dark:bg-black-main">
        <Link href={`/${locale}`} className="flex items-center">
          <Logo className="h-5 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <ThemeSwitcher />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex flex-1">
        {/* Left Side - Image (right side in RTL) */}
        <div 
          className={`hidden md:block md:w-1/2 relative ${isRtl ? 'order-2' : 'order-1'}`}
        >
          <Image
            src="/onboarding-img-01.jpg"
            alt="Welcome to Promptaat"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        {/* Right Side - Content (left side in RTL) */}
        <div 
          className={`w-full md:w-1/2 flex items-center justify-center ${isRtl ? 'order-1' : 'order-2'}`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <div className="w-full max-w-xl px-6 py-12 sm:px-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
