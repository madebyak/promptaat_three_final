"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
  className?: string;
  containerClassName?: string;
}

export function MainLayout({
  children,
  hideFooter = false,
  hideHeader = false,
  className,
  containerClassName,
}: MainLayoutProps) {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  return (
    <div 
      className={cn(
        "flex flex-col min-h-screen bg-white dark:bg-black-main",
        isRTL ? "text-right" : "text-left",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {!hideHeader && <Header />}
      
      <main className={cn(
        "flex-1 w-full mx-auto",
        containerClassName
      )}>
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
}
