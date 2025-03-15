"use client";

import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProPromptContentProps {
  isPro: boolean;
  isUserSubscribed: boolean;
  children: React.ReactNode;
  locale: string;
  className?: string;
}

export function ProPromptContent({
  isPro,
  isUserSubscribed,
  children,
  locale,
  className
}: ProPromptContentProps) {
  // If it's not a pro prompt or the user is subscribed, show content normally
  if (!isPro || isUserSubscribed) {
    return <div className={className}>{children}</div>;
  }
  
  // Otherwise, show blurred content with upgrade prompt
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-10 bg-background/50">
        <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white p-2 rounded-full mb-4">
          <Crown className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {locale === 'ar' ? 'محتوى مميز' : 'Premium Content'}
        </h3>
        <p className="text-sm text-center mb-4 max-w-xs">
          {locale === 'ar' 
            ? 'اشترك في خطتنا المميزة للوصول إلى هذا المحتوى المميز' 
            : 'Subscribe to our Pro plan to access this premium prompt'}
        </p>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-to-r from-purple-500 to-green-500 text-white"
            asChild
          >
            <Link href={`/${locale}/subscription`}>
              {locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
            </Link>
          </Button>
        </div>
      </div>
      <div className="blur-md select-none pointer-events-none">
        {children}
      </div>
    </div>
  );
}
