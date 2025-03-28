"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import Image from "next/image";
import { UpgradeButton } from "@/components/common/upgrade-button";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('ProContent');
  const [showProToAll, setShowProToAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the system setting for showing PRO prompts to all users
  useEffect(() => {
    async function fetchShowProToAllSetting() {
      try {
        const response = await fetch(`/api/system-settings?key=showProToAll`);
        if (response.ok) {
          const data = await response.json();
          setShowProToAll(data.value === "true");
        }
      } catch (error) {
        console.error("Error fetching showProToAll setting:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchShowProToAllSetting();
  }, []);
  
  // Show loading state while fetching the setting
  if (isLoading) {
    return <div className={className}>{children}</div>;
  }
  
  // If the prompt is not Pro, the user is subscribed, or the system setting is enabled,
  // simply show the content
  if (!isPro || isUserSubscribed || showProToAll) {
    return <div className={className}>{children}</div>;
  }

  // For Pro prompts where user is not subscribed and system setting is disabled,
  // show premium overlay
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* First portion of content visible */}
      <div className="relative mb-4 p-4">
        {/* Show a small preview of the content */}
        <div className="opacity-60 text-sm mb-8 line-clamp-2">
          {children}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background pointer-events-none" />
      </div>

      {/* Premium overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] p-6 bg-gradient-to-b from-background/90 via-background/95 to-background/90 backdrop-blur-sm border border-[#6926ea]/20 rounded-lg">
        {/* Premium badge */}
        <div className="absolute top-4 right-4 bg-[#6926ea]/10 border border-[#6926ea]/30 rounded-full px-3 py-1 flex items-center">
          <Crown className="h-3.5 w-3.5 text-[#6926ea] mr-1.5" />
          <span className="text-xs font-medium text-[#6926ea]">
            {locale === 'ar' ? 'محتوى مميز' : 'PRO Content'}
          </span>
        </div>
        
        {/* Premium icon */}
        <div className="mb-4 bg-[#6926ea]/10 p-3 rounded-full">
          <Sparkles className="h-6 w-6 text-[#6926ea]" />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-center mb-2">
          {t('proContentTitle')}
        </h3>
        
        {/* Description */}
        <p className="text-center text-muted-foreground mb-6 max-w-md">
          {t('proContentDescription')}
        </p>
        
        {/* Upgrade button */}
        <UpgradeButton styleVariant="primary" size="lg" locale={locale}>
          {t('upgradeButton')}
        </UpgradeButton>
        
        {/* Features list */}
        <div className="mt-8 w-full max-w-md">
          <h4 className="text-sm font-medium mb-3 text-center">
            {t('proFeaturesTitle')}
          </h4>
          
          <ul className="space-y-2">
            {[
              t('proFeature1'),
              t('proFeature2'),
              t('proFeature3'),
            ].map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-2 mt-1 bg-[#6926ea]/10 rounded-full p-0.5">
                  <svg
                    className="h-3.5 w-3.5 text-[#6926ea]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Satisfaction guarantee */}
        <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
          <Image
            src="/images/satisfaction-guarantee.svg"
            alt="Satisfaction Guarantee"
            width={16}
            height={16}
            className="mr-1.5"
          />
          {t('satisfactionGuarantee')}
        </div>
      </div>
    </div>
  );
}
