"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import Image from "next/image";
import { UpgradeButton } from "@/components/common/upgrade-button";

interface ProPromptContentProps {
  isPro: boolean;
  isUserSubscribed: boolean;
  children: ReactNode;
  locale?: string;
  className?: string;
}

export function ProPromptContent({
  isPro,
  isUserSubscribed,
  children,
  locale = "en",
  className,
}: ProPromptContentProps) {
  // If the prompt is not Pro or the user is subscribed, simply show the content
  if (!isPro || isUserSubscribed) {
    return <div className={className}>{children}</div>;
  }

  // For Pro prompts where user is not subscribed, show premium overlay
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Original content (blurred) */}
      <div className="absolute inset-0 blur-md opacity-40 pointer-events-none">
        {children}
      </div>

      {/* Premium overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] p-6 bg-gradient-to-b from-background/90 via-background/95 to-background/90 backdrop-blur-sm border border-[#6926ea]/20 rounded-lg">
        {/* Premium badge */}
        <div className="absolute top-4 right-4 bg-[#6926ea]/10 border border-[#6926ea]/30 rounded-full px-3 py-1 flex items-center">
          <Crown className="h-3.5 w-3.5 text-[#6926ea] mr-1.5" />
          <span className="text-xs font-medium text-[#6926ea]">
            {locale === "ar" ? "محتوى احترافي" : "Pro Content"}
          </span>
        </div>
        
        {/* Lock illustration */}
        <div className="relative w-48 h-48 mb-6">
          <Image 
            src="/lock-illustration.svg" 
            alt="Premium content"
            width={192}
            height={192}
            className="object-contain"
          />
        </div>
        
        {/* Content preview with gradient fade */}
        <div className="w-full max-w-md mb-6 relative">
          <div className="text-sm text-muted-foreground text-center line-clamp-2 opacity-80">
            {typeof children === 'string' 
              ? children.substring(0, 120) + '...' 
              : 'Premium prompt content'
            }
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none"></div>
        </div>
        
        {/* Title with sparkles icon */}
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="h-5 w-5 text-[#0f6cf4] mr-2" />
          <h3 className="text-xl font-semibold text-primary">
            {locale === "ar" ? "محتوى مميز للمشتركين فقط" : "Exclusive Pro Content"}
          </h3>
        </div>
        
        {/* Description with value proposition */}
        <p className="text-center text-muted-foreground mb-6 max-w-sm">
          {locale === "ar" 
            ? "اشترك الآن للوصول إلى مئات المطالبات الاحترافية عالية الجودة التي تساعدك على تعزيز إنتاجيتك"
            : "Subscribe to unlock hundreds of professional, high-quality prompts that will boost your productivity and creativity"}
        </p>
        
        {/* CTA button with animation */}
        <div className="animate-pulse-slow">
          <UpgradeButton 
            locale={locale} 
            styleVariant="primary" 
            size="lg"
            className="shadow-md shadow-[#0f6cf4]/20 font-medium"
          />
        </div>
        
        {/* Benefits list */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md text-sm">
          <div className="flex items-start">
            <div className="bg-[#4bd51b]/10 rounded-full p-1 mr-2 mt-0.5">
              <Crown className="h-3 w-3 text-[#4bd51b]" />
            </div>
            <span className="text-muted-foreground">
              {locale === "ar" ? "مئات المطالبات الاحترافية" : "Hundreds of pro prompts"}
            </span>
          </div>
          <div className="flex items-start">
            <div className="bg-[#0f6cf4]/10 rounded-full p-1 mr-2 mt-0.5">
              <Crown className="h-3 w-3 text-[#0f6cf4]" />
            </div>
            <span className="text-muted-foreground">
              {locale === "ar" ? "تحديثات شهرية" : "Monthly updates"}
            </span>
          </div>
          <div className="flex items-start">
            <div className="bg-[#6926ea]/10 rounded-full p-1 mr-2 mt-0.5">
              <Crown className="h-3 w-3 text-[#6926ea]" />
            </div>
            <span className="text-muted-foreground">
              {locale === "ar" ? "مطالبات عالية الجودة" : "Expert-crafted content"}
            </span>
          </div>
          <div className="flex items-start">
            <div className="bg-[#4bd51b]/10 rounded-full p-1 mr-2 mt-0.5">
              <Crown className="h-3 w-3 text-[#4bd51b]" />
            </div>
            <span className="text-muted-foreground">
              {locale === "ar" ? "دعم أولوي" : "Priority support"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
