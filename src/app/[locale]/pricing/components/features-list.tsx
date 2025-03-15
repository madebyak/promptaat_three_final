"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import React from 'react';

interface FeaturesListProps {
  locale: string;
  isRTL: boolean;
}

export function FeaturesList({ locale, isRTL }: FeaturesListProps) {
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };

  // Define feature categories
  const featureCategories = [
    {
      name: { en: "Core Features", ar: "الميزات الأساسية" },
      items: [
        { 
          name: { en: "Access to basic prompts", ar: "الوصول إلى المطالبات الأساسية" },
          free: true, 
          pro: true 
        },
        { 
          name: { en: "Save favorites", ar: "حفظ المفضلة" },
          free: true, 
          pro: true 
        },
        { 
          name: { en: "Share prompts", ar: "مشاركة المطالبات" },
          free: true, 
          pro: true 
        },
        { 
          name: { en: "Community support", ar: "دعم المجتمع" },
          free: true, 
          pro: true 
        }
      ]
    },
    {
      name: { en: "Premium Features", ar: "الميزات المتميزة" },
      items: [
        { 
          name: { en: "Access to all premium prompts", ar: "الوصول إلى جميع المطالبات المتميزة" },
          free: false, 
          pro: true 
        },
        { 
          name: { en: "Early access to new prompts", ar: "وصول مبكر إلى المطالبات الجديدة" },
          free: false, 
          pro: true 
        },
        { 
          name: { en: "No ads or watermarks", ar: "بدون إعلانات أو علامات مائية" },
          free: false, 
          pro: true 
        },
        { 
          name: { en: "Priority support", ar: "دعم ذو أولوية" },
          free: false, 
          pro: true 
        }
      ]
    },
    {
      name: { en: "Advanced Features", ar: "الميزات المتقدمة" },
      items: [
        { 
          name: { en: "Request custom prompts", ar: "طلب مطالبات مخصصة" },
          free: false, 
          pro: true 
        },
        { 
          name: { en: "Advanced prompt customization", ar: "تخصيص متقدم للمطالبات" },
          free: false, 
          pro: true 
        },
        { 
          name: { en: "Export prompts in multiple formats", ar: "تصدير المطالبات بتنسيقات متعددة" },
          free: false, 
          pro: true 
        }
      ]
    }
  ];

  return (
    <div className={cn("max-w-5xl mx-auto", isRTL && "rtl")}>
      <div className="overflow-x-auto rounded-xl shadow-sm border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className={cn(
                "py-5 px-6 text-left font-semibold text-lg",
                isRTL && "text-right"
              )}>
                {t({ en: "Features", ar: "الميزات" })}
              </th>
              <th className="py-5 px-6 text-center font-semibold text-lg">
                {t({ en: "Free", ar: "مجاني" })}
              </th>
              <th className="py-5 px-6 text-center font-semibold text-lg">
                {t({ en: "Pro", ar: "احترافي" })}
              </th>
            </tr>
          </thead>
          <tbody>
            {featureCategories.map((category, categoryIndex) => (
              <React.Fragment key={`category-${categoryIndex}`}>
                <tr className="bg-primary/5">
                  <td 
                    colSpan={3} 
                    className={cn(
                      "py-4 px-6 font-medium text-primary",
                      isRTL && "text-right"
                    )}
                  >
                    {t(category.name)}
                  </td>
                </tr>
                {category.items.map((feature, featureIndex) => (
                  <tr 
                    key={`feature-${categoryIndex}-${featureIndex}`}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className={cn(
                      "py-4 px-6 text-sm",
                      isRTL && "text-right"
                    )}>
                      {t(feature.name)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.free ? (
                        <div className="flex justify-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Minus className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.pro ? (
                        <div className="flex justify-center">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Minus className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
