"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SubscriptionStatus {
  id: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
}

interface SubscriptionStatusCardProps {
  subscription: SubscriptionStatus;
  locale: string;
}

export function SubscriptionStatusCard({ subscription, locale }: SubscriptionStatusCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isRTL = locale === "ar";
  
  // Helper function to get localized text
  const t = (en: string, ar: string) => {
    return locale === "ar" ? ar : en;
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm(t(
      "Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.",
      "هل أنت متأكد أنك تريد إلغاء اشتراكك؟ سيظل لديك حق الوصول حتى نهاية فترة الفوترة الخاصة بك."
    ))) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/stripe/subscription/${subscription.stripeSubscriptionId}/cancel`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel subscription");
      }
      
      toast({
        title: t("Subscription Cancelled", "تم إلغاء الاشتراك"),
        description: t(
          "Your subscription has been cancelled and will end on your next billing date.",
          "تم إلغاء اشتراكك وسينتهي في تاريخ الفوترة التالي."
        ),
      });
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: t("Error", "خطأ"),
        description: t(
          "There was a problem cancelling your subscription. Please try again.",
          "حدثت مشكلة أثناء إلغاء اشتراكك. يرجى المحاولة مرة أخرى."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/stripe/subscription/${subscription.stripeSubscriptionId}/reactivate`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reactivate subscription");
      }
      
      toast({
        title: t("Subscription Reactivated", "تمت إعادة تفعيل الاشتراك"),
        description: t(
          "Your subscription has been reactivated and will continue after your current billing period.",
          "تمت إعادة تفعيل اشتراكك وسيستمر بعد فترة الفوترة الحالية."
        ),
      });
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast({
        title: t("Error", "خطأ"),
        description: t(
          "There was a problem reactivating your subscription. Please try again.",
          "حدثت مشكلة أثناء إعادة تفعيل اشتراكك. يرجى المحاولة مرة أخرى."
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <CardTitle>{t("Subscription Status", "حالة الاشتراك")}</CardTitle>
          <Badge 
            variant={subscription.status === "active" ? "default" : "outline"}
            className={subscription.cancelAtPeriodEnd ? "bg-yellow-500" : ""}
          >
            {subscription.status === "active" 
              ? subscription.cancelAtPeriodEnd 
                ? t("Cancelling", "قيد الإلغاء") 
                : t("Active", "نشط")
              : t("Inactive", "غير نشط")}
          </Badge>
        </div>
        <CardDescription>
          {t("Your current subscription details", "تفاصيل اشتراكك الحالي")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`space-y-2 text-${isRTL ? "right" : "left"}`}>
          <div className="text-sm">
            {subscription.cancelAtPeriodEnd 
              ? t(
                  "Your subscription will end on", 
                  "سينتهي اشتراكك في"
                )
              : t(
                  "Your subscription will renew on", 
                  "سيتم تجديد اشتراكك في"
                )
            }
          </div>
          <div className="font-medium">
            {format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy")}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {subscription.cancelAtPeriodEnd ? (
          <Button 
            onClick={handleReactivateSubscription} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />}
            {t("Reactivate Subscription", "إعادة تفعيل الاشتراك")}
          </Button>
        ) : (
          <Button 
            onClick={handleCancelSubscription} 
            variant="outline" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />}
            {t("Cancel Subscription", "إلغاء الاشتراك")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
