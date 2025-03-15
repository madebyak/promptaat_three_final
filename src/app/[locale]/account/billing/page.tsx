"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Subscription {
  id: string;
  userId: string;
  plan: string;
  interval: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
}

export default function BillingPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);
  
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  
  // Helper function to get localized text
  const t = (text: { [key: string]: string }) => {
    return locale === "ar" ? text.ar : text.en;
  };
  
  // Fetch subscription data
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/login?redirect=/account/billing`);
      return;
    }
    
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions");
        
        if (!response.ok) {
          throw new Error("Failed to fetch subscription data");
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError(t({
          en: "Failed to load subscription details",
          ar: "فشل تحميل تفاصيل الاشتراك"
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [status, router, locale, t]);
  
  // Handle manage subscription button click
  const handleManageSubscription = async () => {
    if (!subscription?.stripeCustomerId) {
      router.push(`/${locale}/pricing`);
      return;
    }
    
    setIsCreatingPortal(true);
    
    try {
      const response = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: subscription.stripeCustomerId,
          returnUrl: `${window.location.origin}/${locale}/account/billing`,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create billing portal session");
      }
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      setError(t({
        en: "Failed to open billing portal",
        ar: "فشل فتح بوابة الفواتير"
      }));
      setIsCreatingPortal(false);
    }
  };
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP", {
      locale: locale === "ar" ? ar : enUS,
    });
  };
  
  // Get plan name based on subscription plan
  const getPlanName = (plan: string) => {
    return plan === "pro" 
      ? t({ en: "Pro", ar: "احترافي" }) 
      : t({ en: "Free", ar: "مجاني" });
  };
  
  // Get interval name based on subscription interval
  const getIntervalName = (interval: string) => {
    switch (interval) {
      case "monthly":
        return t({ en: "Monthly", ar: "شهري" });
      case "quarterly":
        return t({ en: "3 Months", ar: "3 أشهر" });
      case "annual":
        return t({ en: "Annual", ar: "سنوي" });
      default:
        return interval;
    }
  };
  
  // Get status name based on subscription status
  const getStatusName = (status: string) => {
    switch (status) {
      case "active":
        return t({ en: "Active", ar: "نشط" });
      case "canceled":
        return t({ en: "Canceled", ar: "ملغى" });
      case "past_due":
        return t({ en: "Past Due", ar: "متأخر" });
      case "unpaid":
        return t({ en: "Unpaid", ar: "غير مدفوع" });
      case "incomplete":
        return t({ en: "Incomplete", ar: "غير مكتمل" });
      case "incomplete_expired":
        return t({ en: "Expired", ar: "منتهي الصلاحية" });
      default:
        return status;
    }
  };
  
  // Get status color based on subscription status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "canceled":
        return "text-red-500";
      case "past_due":
      case "unpaid":
      case "incomplete":
      case "incomplete_expired":
        return "text-amber-500";
      default:
        return "text-muted-foreground";
    }
  };
  
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className={cn(
      "container max-w-4xl mx-auto py-16 px-4",
      isRTL && "rtl"
    )}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t({ en: "Billing & Subscription", ar: "الفواتير والاشتراك" })}
        </h1>
        <p className="text-muted-foreground">
          {t({ 
            en: "Manage your subscription and billing information", 
            ar: "إدارة اشتراكك ومعلومات الفواتير الخاصة بك" 
          })}
        </p>
      </div>
      
      {error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Subscription Details", ar: "تفاصيل الاشتراك" })}
            </CardTitle>
            <CardDescription>
              {subscription 
                ? t({ 
                    en: "Your current subscription information", 
                    ar: "معلومات اشتراكك الحالي" 
                  })
                : t({ 
                    en: "You don't have an active subscription", 
                    ar: "ليس لديك اشتراك نشط" 
                  })
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t({ en: "Plan", ar: "الخطة" })}
                  </span>
                  <span className="font-medium">
                    {getPlanName(subscription.plan)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t({ en: "Billing Cycle", ar: "دورة الفوترة" })}
                  </span>
                  <span className="font-medium">
                    {getIntervalName(subscription.interval)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t({ en: "Status", ar: "الحالة" })}
                  </span>
                  <span className={cn("font-medium", getStatusColor(subscription.status))}>
                    {getStatusName(subscription.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t({ en: "Current Period", ar: "الفترة الحالية" })}
                  </span>
                  <span className="font-medium">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-md">
                    {t({ 
                      en: "Your subscription is set to cancel at the end of the current billing period.", 
                      ar: "تم تعيين اشتراكك للإلغاء في نهاية فترة الفوترة الحالية." 
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="mb-4">
                  {t({ 
                    en: "You don't have an active subscription yet.", 
                    ar: "ليس لديك اشتراك نشط حتى الآن." 
                  })}
                </p>
                <Button 
                  onClick={() => router.push(`/${locale}/pricing`)}
                  className="w-full"
                >
                  {t({ en: "View Plans", ar: "عرض الخطط" })}
                </Button>
              </div>
            )}
          </CardContent>
          {subscription && (
            <CardFooter>
              <Button 
                onClick={handleManageSubscription} 
                className="w-full"
                disabled={isCreatingPortal}
              >
                {isCreatingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t({ en: "Manage Subscription", ar: "إدارة الاشتراك" })}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ en: "Payment Methods", ar: "طرق الدفع" })}
            </CardTitle>
            <CardDescription>
              {t({ 
                en: "Manage your payment methods and billing information", 
                ar: "إدارة طرق الدفع ومعلومات الفواتير الخاصة بك" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <p>
                  {t({ 
                    en: "Your payment methods are managed through Stripe's secure portal.", 
                    ar: "تتم إدارة طرق الدفع الخاصة بك من خلال بوابة Stripe الآمنة." 
                  })}
                </p>
                <p className="text-muted-foreground text-sm">
                  {t({ 
                    en: "Click the button below to manage your payment methods, view invoices, and update your billing information.", 
                    ar: "انقر على الزر أدناه لإدارة طرق الدفع الخاصة بك، وعرض الفواتير، وتحديث معلومات الفواتير الخاصة بك." 
                  })}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="mb-4">
                  {t({ 
                    en: "Subscribe to a plan to add payment methods.", 
                    ar: "اشترك في خطة لإضافة طرق الدفع." 
                  })}
                </p>
              </div>
            )}
          </CardContent>
          {subscription && (
            <CardFooter>
              <Button 
                onClick={handleManageSubscription} 
                variant="outline"
                className="w-full"
                disabled={isCreatingPortal}
              >
                {isCreatingPortal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t({ en: "Manage Payment Methods", ar: "إدارة طرق الدفع" })}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
