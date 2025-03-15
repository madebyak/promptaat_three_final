"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingFAQProps {
  items: Array<{
    question: {
      en: string;
      ar: string;
    };
    answer: {
      en: string;
      ar: string;
    };
  }>;
  locale: string;
  isRTL: boolean;
}

export function PricingFAQ({ items, locale, isRTL }: PricingFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default first item open
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-5">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={cn(
              "border rounded-xl overflow-hidden transition-all duration-200",
              openIndex === index 
                ? "border-primary/30 shadow-md" 
                : "border-border hover:border-primary/20"
            )}
          >
            <button
              onClick={() => toggleItem(index)}
              className={cn(
                "flex items-center justify-between w-full p-5 text-left font-medium focus:outline-none transition-colors",
                openIndex === index ? "bg-primary/5 text-primary" : "hover:bg-muted/30",
                isRTL && "flex-row-reverse text-right"
              )}
              aria-expanded={openIndex === index}
              aria-controls={`faq-content-${index}`}
            >
              <span className="text-base">{t(item.question)}</span>
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full transition-colors",
                openIndex === index 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {openIndex === index ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
            
            {openIndex === index && (
              <div 
                id={`faq-content-${index}`}
                className={cn(
                  "p-5 pt-0 text-muted-foreground",
                  isRTL && "text-right"
                )}
              >
                <p className="mt-4 leading-relaxed text-sm">{t(item.answer)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
