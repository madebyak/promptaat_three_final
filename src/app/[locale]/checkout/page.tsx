"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const plan = searchParams.get("plan") || "pro";
  const cycle = searchParams.get("cycle") || "monthly";
  
  // Helper function to get localized text
  const t = (text: { [key: string]: string }) => {
    return locale === "ar" ? text.ar : text.en;
  };
  
  // Pricing data
  const pricingData = {
    free: {
      monthly: 0,
      quarterly: 0,
      annual: 0
    },
    pro: {
      monthly: 14.99,
      quarterly: 39.99,
      annual: 119.99
    }
  };
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login?redirect=/checkout?plan=${plan}&cycle=${cycle}`);
    }
  }, [status, router, locale, plan, cycle]);
  
  // Handle checkout
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          interval: cycle,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      
      const data = await response.json();
      
      // If free plan, redirect to home
      if (plan === "free") {
        router.push(`/${locale}`);
        return;
      }
      
      // For paid plans, redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const planTitle = plan === "pro" 
    ? t({ en: "Pro", ar: "احترافي" }) 
    : t({ en: "Free", ar: "مجاني" });
  
  const cycleTitle = cycle === "annual"
    ? t({ en: "Annual", ar: "سنوي" })
    : cycle === "quarterly"
      ? t({ en: "3 Months", ar: "3 أشهر" })
      : t({ en: "Monthly", ar: "شهري" });
  
  // Get price based on plan and cycle
  const price = pricingData[plan as keyof typeof pricingData][cycle as keyof typeof pricingData.pro];
  
  return (
    <div className={cn(
      "container max-w-md mx-auto py-16 px-4",
      isRTL && "rtl"
    )}>
      <Card>
        <CardHeader>
          <CardTitle>
            {t({ en: "Confirm Subscription", ar: "تأكيد الاشتراك" })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: "You are about to subscribe to the",
              ar: "أنت على وشك الاشتراك في خطة"
            })}
            {" "}
            <strong>{planTitle}</strong>
            {" "}
            {t({ en: "plan with", ar: "بدورة فوترة" })}
            {" "}
            <strong>{cycleTitle}</strong>
            {" "}
            {t({ en: "billing cycle", ar: "دورة الفوترة" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>{t({ en: "Plan", ar: "الخطة" })}</span>
              <span className="font-medium">{planTitle}</span>
            </div>
            <div className="flex justify-between">
              <span>{t({ en: "Billing Cycle", ar: "دورة الفوترة" })}</span>
              <span className="font-medium">{cycleTitle}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="font-medium">{t({ en: "Total", ar: "المجموع" })}</span>
              <span className="font-bold">
                {price === 0 
                  ? t({ en: "Free", ar: "مجاني" }) 
                  : cycle === "monthly" 
                    ? `$${price}/mo`
                    : cycle === "quarterly"
                      ? `$${price}/3mo`
                      : `$${price}/yr`}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleCheckout} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t({ en: "Confirm Subscription", ar: "تأكيد الاشتراك" })}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => router.push(`/${locale}/pricing`)}
            disabled={isLoading}
          >
            {t({ en: "Back to Pricing", ar: "العودة إلى التسعير" })}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
