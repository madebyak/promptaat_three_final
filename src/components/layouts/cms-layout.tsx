"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  FileText, 
  Tag, 
  Settings, 
  CreditCard, 
  Users, 
  ArrowLeft,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CMSLayoutProps {
  children: React.ReactNode;
}

export function CMSLayout({ children }: CMSLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Check if user is authenticated and loading state
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`;
    }
  }, [isLoading, isAuthenticated, locale, pathname]);
  
  // Check if user is admin
  const isAdmin = session?.user?.role === "ADMIN";
  
  // Redirect to home if not admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      window.location.href = `/${locale}`;
    }
  }, [isLoading, isAuthenticated, isAdmin, locale]);
  
  // If still loading or not authenticated, show loading state
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Navigation items
  const navItems = [
    {
      name: t({ en: "Dashboard", ar: "لوحة التحكم" }),
      href: `/${locale}/cms`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: t({ en: "Prompts", ar: "الإرشادات" }),
      href: `/${locale}/cms/prompts`,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: t({ en: "Categories", ar: "الفئات" }),
      href: `/${locale}/cms/categories`,
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: t({ en: "Users", ar: "المستخدمون" }),
      href: `/${locale}/cms/users`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: t({ en: "Subscriptions", ar: "الاشتراكات" }),
      href: `/${locale}/cms/subscriptions`,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: t({ en: "Settings", ar: "الإعدادات" }),
      href: `/${locale}/cms/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Check if a nav item is active
  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };
  
  return (
    <div className={cn(
      "flex min-h-screen flex-col",
      isRTL && "rtl"
    )}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="container flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="font-bold text-xl">Promptaat CMS</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t({ en: "Toggle menu", ar: "تبديل القائمة" })}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-background lg:flex",
          isRTL && "left-auto right-0 border-l border-r-0"
        )}>
          <div className="flex h-16 items-center border-b px-6">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <span className="font-bold text-xl">Promptaat CMS</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-6 px-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <Link href={`/${locale}`}>
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeft className={cn(
                  "mr-2 h-4 w-4",
                  isRTL && "mr-0 ml-2 rotate-180"
                )} />
                {t({ en: "Back to Site", ar: "العودة إلى الموقع" })}
              </Button>
            </Link>
          </div>
        </aside>
        
        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background",
              isRTL && "left-auto right-0 border-l border-r-0"
            )}>
              <div className="flex h-16 items-center border-b px-6">
                <Link href={`/${locale}`} className="flex items-center space-x-2">
                  <span className="font-bold text-xl">Promptaat CMS</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-auto py-6 px-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="border-t p-4">
                <Link href={`/${locale}`}>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                    <ArrowLeft className={cn(
                      "mr-2 h-4 w-4",
                      isRTL && "mr-0 ml-2 rotate-180"
                    )} />
                    {t({ en: "Back to Site", ar: "العودة إلى الموقع" })}
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        )}
        
        {/* Main content */}
        <main className={cn(
          "flex-1 lg:pl-64",
          isRTL && "lg:pl-0 lg:pr-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
