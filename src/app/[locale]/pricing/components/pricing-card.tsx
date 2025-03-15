"use client";

import { Check, Crown, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: "free" | "pro";
  data: {
    name: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    price: {
      monthly: number;
      quarterly: number;
      annual: number;
    };
    cta: {
      en: string;
      ar: string;
    };
    popular: boolean;
  };
  features: Array<{
    en: string;
    ar: string;
  }>;
  billingCycle: "monthly" | "quarterly" | "annual";
  locale: string;
  isRTL: boolean;
  onSubscribe: () => void;
}

export function PricingCard({
  plan,
  data,
  features,
  billingCycle,
  locale,
  isRTL,
  onSubscribe
}: PricingCardProps) {
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };

  // Get the current price based on billing cycle
  const price = data.price[billingCycle];
  
  // Calculate monthly equivalent for quarterly and annual plans
  const monthlyEquivalent = billingCycle === "quarterly" 
    ? (data.price.quarterly / 3).toFixed(2)
    : billingCycle === "annual"
      ? (data.price.annual / 12).toFixed(2)
      : data.price.monthly;

  // Get the appropriate icon for the plan
  const PlanIcon = plan === "free" ? Zap : Crown;

  return (
    <Card className={cn(
      "relative h-full flex flex-col transition-all hover:shadow-lg",
      data.popular ? "border-primary shadow-md" : "border-border",
      isRTL && "rtl"
    )}>
      {data.popular && (
        <Badge className={cn(
          "absolute top-0 right-0 m-4 bg-primary text-primary-foreground",
          isRTL && "left-0 right-auto"
        )}>
          {t({ en: "Most Popular", ar: "الأكثر شعبية" })}
        </Badge>
      )}

      <CardHeader className="pb-8">
        <div className="flex items-center gap-2 mb-4">
          <PlanIcon className={cn(
            "h-6 w-6",
            plan === "pro" ? "text-primary" : "text-muted-foreground"
          )} />
          <CardTitle className="text-xl">{t(data.name)}</CardTitle>
        </div>

        <div className="flex items-baseline gap-1">
          {price === 0 ? (
            <span className="text-4xl font-bold">
              {t({ en: "Free", ar: "مجاني" })}
            </span>
          ) : (
            <>
              <span className="text-4xl font-bold">
                ${price}
              </span>
              <span className="text-muted-foreground text-sm">
                /{t({ 
                  en: billingCycle === "monthly" ? "mo" : billingCycle === "quarterly" ? "3mo" : "yr", 
                  ar: billingCycle === "monthly" ? "شهر" : billingCycle === "quarterly" ? "3 أشهر" : "سنة" 
                })}
              </span>
            </>
          )}
        </div>

        {price > 0 && billingCycle !== "monthly" && (
          <div className="text-sm text-muted-foreground mt-1">
            {t({ 
              en: `$${monthlyEquivalent}/mo billed ${billingCycle === "quarterly" ? "quarterly" : "annually"}`,
              ar: `$${monthlyEquivalent}/شهر تُدفع ${billingCycle === "quarterly" ? "كل 3 أشهر" : "سنويًا"}`
            })}
          </div>
        )}

        <CardDescription className="mt-4">{t(data.description)}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className={cn(
              "flex items-start gap-2",
              isRTL && "flex-row-reverse text-right"
            )}>
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{t(feature)}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={onSubscribe}
          className={cn(
            "w-full",
            plan === "free" && "bg-secondary text-secondary-foreground hover:bg-secondary/90"
          )}
          variant={plan === "free" ? "outline" : "default"}
        >
          {t(data.cta)}
        </Button>
      </CardFooter>
    </Card>
  );
}
