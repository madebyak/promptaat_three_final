"use client";

import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BillingCycleToggleProps {
  value: "monthly" | "quarterly" | "annual";
  onChange: (value: "monthly" | "quarterly" | "annual") => void;
  locale: string;
  isRTL: boolean;
}

export function BillingCycleToggle({ 
  value, 
  onChange, 
  locale, 
  isRTL 
}: BillingCycleToggleProps) {
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      isRTL && "rtl"
    )}>
      <h3 className="text-lg font-medium mb-5">
        {t({ en: "Choose Billing Cycle", ar: "اختر دورة الفوترة" })}
      </h3>
      
      <RadioGroup 
        value={value}
        onValueChange={(val) => onChange(val as "monthly" | "quarterly" | "annual")}
        className="flex flex-wrap justify-center gap-3 sm:gap-4"
      >
        <div className={cn(
          "flex items-center space-x-2 rounded-lg border p-2 cursor-pointer transition-all duration-200",
          value === "monthly" ? "border-primary bg-primary/5" : "border-input hover:border-muted",
          isRTL && "space-x-reverse"
        )}>
          <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
          <Label 
            htmlFor="monthly" 
            className={cn(
              "cursor-pointer px-4 py-2 text-sm font-medium rounded-md transition-colors",
              value === "monthly" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t({ en: "Monthly", ar: "شهري" })}
          </Label>
        </div>
        
        <div className={cn(
          "flex items-center space-x-2 rounded-lg border p-2 cursor-pointer transition-all duration-200",
          value === "quarterly" ? "border-primary bg-primary/5" : "border-input hover:border-muted",
          isRTL && "space-x-reverse"
        )}>
          <RadioGroupItem value="quarterly" id="quarterly" className="sr-only" />
          <Label 
            htmlFor="quarterly" 
            className={cn(
              "cursor-pointer px-4 py-2 text-sm font-medium rounded-md transition-colors",
              value === "quarterly" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t({ en: "3 Months", ar: "3 أشهر" })}
          </Label>
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50 font-medium">
            {t({ en: "Save 11%", ar: "وفر 11%" })}
          </Badge>
        </div>
        
        <div className={cn(
          "flex items-center space-x-2 rounded-lg border p-2 cursor-pointer transition-all duration-200",
          value === "annual" ? "border-primary bg-primary/5" : "border-input hover:border-muted",
          isRTL && "space-x-reverse"
        )}>
          <RadioGroupItem value="annual" id="annual" className="sr-only" />
          <Label 
            htmlFor="annual" 
            className={cn(
              "cursor-pointer px-4 py-2 text-sm font-medium rounded-md transition-colors",
              value === "annual" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t({ en: "Annual", ar: "سنوي" })}
          </Label>
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50 font-medium">
            {t({ en: "Save 33%", ar: "وفر 33%" })}
          </Badge>
        </div>
      </RadioGroup>
    </div>
  );
}
