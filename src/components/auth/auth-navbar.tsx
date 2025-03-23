'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Home, HelpCircle, FileText } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeSwitcher } from '@/components/layout/theme-switcher';

interface AuthNavbarProps {
  locale?: string;
}

export function AuthNavbar({ locale = 'en' }: AuthNavbarProps) {
  const params = useParams();
  const currentLocale = (params.locale as string) || locale;
  const isRtl = currentLocale === 'ar';

  const translations = {
    home: currentLocale === 'ar' ? 'الرئيسية' : 'Home',
    faq: currentLocale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
    help: currentLocale === 'ar' ? 'المساعدة' : 'Help',
    logoAlt: currentLocale === 'ar' ? 'شعار بروبتات' : 'Promptaat Logo',
    navAriaLabel: currentLocale === 'ar' ? 'التنقل الرئيسي' : 'Main Navigation',
    menuAriaLabel: currentLocale === 'ar' ? 'قائمة المساعدة' : 'Help Menu',
  };

  return (
    <header role="banner">
      <nav 
        className="fixed top-0 left-0 right-0 z-20 py-4 px-6 md:px-10 flex justify-between items-center"
        aria-label={translations.navAriaLabel}
      >
        <div className="flex items-center">
          <Link 
            href={`/${currentLocale}`} 
            className="flex items-center" 
            aria-label={translations.home}
          >
            <Image 
              src="/Promptaat_logo_white.svg" 
              alt={translations.logoAlt}
              width={75} 
              height={20} 
              className="h-6 w-auto dark:block hidden" 
              priority
            />
            <Image 
              src="/Promptaat_logo_white.svg" 
              alt={translations.logoAlt}
              width={75} 
              height={20} 
              className="h-6 w-auto dark:hidden block" 
              priority
            />
          </Link>
        </div>
        <div className={`flex items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div 
            className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}
            role="menubar"
            aria-label={translations.menuAriaLabel}
          >
            <Link 
              href={`/${currentLocale}`} 
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors px-2"
              role="menuitem"
              aria-label={translations.home}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">{translations.home}</span>
            </Link>
            <div className="h-4 w-px bg-border dark:bg-dark-border mx-1"></div>
            <Link 
              href={`/${currentLocale}/faq`} 
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors px-2"
              role="menuitem"
              aria-label={translations.faq}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">{translations.faq}</span>
            </Link>
            <div className="h-4 w-px bg-border dark:bg-dark-border mx-1"></div>
            <Link 
              href={`/${currentLocale}/docs`} 
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors px-2"
              role="menuitem"
              aria-label={translations.help}
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only md:not-sr-only">{translations.help}</span>
            </Link>
          </div>
          <div className="h-4 w-px bg-border dark:bg-dark-border mx-3"></div>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <ThemeSwitcher />
            <LanguageSwitcher locale={currentLocale} />
          </div>
        </div>
      </nav>
    </header>
  );
}
