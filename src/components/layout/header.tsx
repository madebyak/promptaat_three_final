"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only show theme toggle on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-white dark:bg-black-main",
      "border-gray-200 dark:border-gray-800"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <span className="font-bold text-xl">Promptaat</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              href={`/${locale}/prompts`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t({ en: "Prompts", ar: "النماذج" })}
            </Link>
            <Link 
              href={`/${locale}/blog`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t({ en: "Blog", ar: "المدونة" })}
            </Link>
            <Link 
              href={`/${locale}/about-us`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t({ en: "About", ar: "عن الشركة" })}
            </Link>
            <Link 
              href={`/${locale}/contact`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t({ en: "Contact", ar: "اتصل بنا" })}
            </Link>
          </nav>

          {/* Right section with theme and language toggles */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Language toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Change language"
              asChild
            >
              <Link href={`/${locale === "en" ? "ar" : "en"}${params.slug ? `/${params.slug}` : ""}`}>
                <Globe className="h-5 w-5" />
              </Link>
            </Button>

            {/* Login / Register */}
            <div className="hidden md:flex space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/${locale}/login`}>
                  {t({ en: "Login", ar: "تسجيل الدخول" })}
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/${locale}/register`}>
                  {t({ en: "Register", ar: "التسجيل" })}
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black-main border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-5 space-y-4">
            <Link 
              href={`/${locale}/prompts`}
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t({ en: "Prompts", ar: "النماذج" })}
            </Link>
            <Link 
              href={`/${locale}/blog`}
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t({ en: "Blog", ar: "المدونة" })}
            </Link>
            <Link 
              href={`/${locale}/about-us`}
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t({ en: "About", ar: "عن الشركة" })}
            </Link>
            <Link 
              href={`/${locale}/contact`}
              className="block text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t({ en: "Contact", ar: "اتصل بنا" })}
            </Link>
            
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${locale}/login`} onClick={() => setIsMobileMenuOpen(false)}>
                  {t({ en: "Login", ar: "تسجيل الدخول" })}
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href={`/${locale}/register`} onClick={() => setIsMobileMenuOpen(false)}>
                  {t({ en: "Register", ar: "التسجيل" })}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
