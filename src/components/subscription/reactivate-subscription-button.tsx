'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ReactivateSubscriptionButtonProps {
  subscriptionId: string;
  onReactivationSuccess?: () => void;
  variant?: "outline" | "default" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  locale?: string;
}

export function ReactivateSubscriptionButton({
  subscriptionId,
  onReactivationSuccess,
  variant = "default",
  size = "sm",
  locale = "en",
}: ReactivateSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const reactivateSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reactivate subscription");
      }

      toast({
        title: locale === "ar" ? "تم إلغاء إلغاء الاشتراك" : "Subscription Reactivated",
        description: locale === "ar" 
          ? "تم تنشيط اشتراكك مرة أخرى وستستمر بعد الفترة الحالية." 
          : "Your subscription has been reactivated and will continue after the current period.",
        variant: "default",
      });

      // Call the success callback if provided
      if (onReactivationSuccess) {
        onReactivationSuccess();
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast({
        title: locale === "ar" ? "فشل إعادة التنشيط" : "Reactivation Failed",
        description: locale === "ar"
          ? "حدث خطأ أثناء محاولة إعادة تنشيط اشتراكك. يرجى المحاولة مرة أخرى."
          : "There was an error reactivating your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={reactivateSubscription}
      disabled={isLoading}
      className="bg-gradient-to-r from-purple-500 to-green-500 text-white hover:from-purple-600 hover:to-green-600"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {locale === "ar" ? "جارٍ إعادة التنشيط..." : "Reactivating..."}
        </>
      ) : (
        locale === "ar" ? "إلغاء الإلغاء" : "Keep Subscription"
      )}
    </Button>
  );
}
