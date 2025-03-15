'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { CancellationConfirmModal } from "./cancellation-confirm-modal";

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
  currentPeriodEnd: Date;
  onCancellationSuccess?: () => void;
  variant?: "outline" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  locale?: string;
}

export function CancelSubscriptionButton({
  subscriptionId,
  currentPeriodEnd,
  onCancellationSuccess,
  variant = "outline",
  size = "sm",
  locale = "en",
}: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
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
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast({
        title: locale === "ar" ? "تم جدولة إلغاء الاشتراك" : "Subscription Cancellation Scheduled",
        description: locale === "ar" 
          ? `سيتم إلغاء اشتراكك في نهاية فترة الفوترة الحالية.` 
          : `Your subscription will be canceled at the end of the current billing period.`,
        variant: "default",
      });

      // Call the success callback if provided
      if (onCancellationSuccess) {
        onCancellationSuccess();
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: locale === "ar" ? "فشل إلغاء الاشتراك" : "Cancellation Failed",
        description: locale === "ar"
          ? "حدث خطأ أثناء محاولة إلغاء اشتراكك. يرجى المحاولة مرة أخرى."
          : "There was an error canceling your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === "ar" ? "جارٍ الإلغاء..." : "Canceling..."}
          </>
        ) : (
          locale === "ar" ? "إلغاء الاشتراك" : "Cancel"
        )}
      </Button>
      
      <CancellationConfirmModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onConfirm={cancelSubscription}
        currentPeriodEnd={currentPeriodEnd}
        locale={locale}
      />
    </>
  );
}
