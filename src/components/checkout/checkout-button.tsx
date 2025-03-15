"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps extends ButtonProps {
  plan: string;
  interval: "monthly" | "quarterly" | "annual";
  locale: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  plan,
  interval,
  locale,
  children,
  ...props
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Call the checkout API route
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          interval,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: locale === "ar" ? "حدث خطأ" : "Error",
        description: locale === "ar" 
          ? "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى." 
          : "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {locale === "ar" ? "جارٍ المعالجة..." : "Processing..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
