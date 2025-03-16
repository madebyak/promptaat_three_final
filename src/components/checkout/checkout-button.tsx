"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface CheckoutButtonProps extends ButtonProps {
  priceId: string;
  locale?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  priceId,
  locale = "en",
  children,
  ...props
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleCheckout = async () => {
    try {
      // If user is not logged in, redirect to login page
      if (!session) {
        router.push(`/${locale}/auth/login?redirect=/pricing`);
        return;
      }

      setIsLoading(true);

      // Log checkout attempt for debugging
      console.log("Starting checkout process:", {
        priceId,
        locale,
        userId: session?.user?.id,
      });

      // Call the checkout API route
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Checkout error:", {
          status: response.status,
          statusText: response.statusText,
          error: data.error || "Unknown error",
          priceId,
        });
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url);
      } else {
        console.error("No checkout URL returned from API");
        throw new Error("No checkout URL was provided");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast({
        title: locale === "ar" ? "حدث خطأ" : "Error",
        description: locale === "ar" 
          ? "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى." 
          : `An error occurred during checkout. Please try again. ${error instanceof Error ? error.message : ''}`,
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
