"use client";

import { useState, useEffect } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps extends ButtonProps {
  priceId: string;
  locale: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  priceId,
  locale,
  children,
  className,
  ...props
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  
  // Debug session status
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session ? {
      hasUser: !!session.user,
      userEmail: session.user?.email,
      userId: session.user?.id
    } : null);
  }, [session, status]);

  const handleSubscribe = async () => {
    console.log("Subscribe clicked, session status:", status);
    console.log("Price ID:", priceId);
    
    if (status === "loading") {
      setError("Please wait while we authenticate your session...");
      return;
    }
    
    if (!session || status !== "authenticated") {
      console.log("No active session, redirecting to login");
      const callbackUrl = `${window.location.origin}/${locale}/pricing`;
      signIn(undefined, { callbackUrl });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Validate the price ID
      if (!priceId) {
        console.error("Missing priceId:", { providedPriceId: priceId });
        setError(locale === "ar" ? "معرف السعر مفقود" : "Missing price ID");
        setIsLoading(false);
        return;
      }
      
      console.log("Starting subscription creation with priceId:", priceId);
      console.log("Environment check:", { 
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      });

      // Call the API to create a Stripe checkout session
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      if (!response.ok) {
        // Try to get the detailed error message
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || response.statusText || "Unknown error";
        const errorCode = errorData.code || "unknown";
        
        console.error("Subscription API error:", { 
          status: response.status, 
          statusText: response.statusText,
          errorData,
          errorMessage,
          errorCode
        });
        
        throw new Error(`${errorMessage} (${errorCode})`);
      }

      const data = await response.json();
      
      if (!data.url) {
        console.error("Missing checkout URL in response:", data);
        throw new Error(locale === "ar" ? "رابط الدفع مفقود" : "Missing checkout URL");
      }
      
      console.log("Redirecting to Stripe checkout:", { url: data.url.substring(0, 50) + "..." });
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      setError(
        error instanceof Error
          ? error.message
          : locale === "ar" 
            ? "حدث خطأ غير معروف" 
            : "An unknown error occurred"
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSubscribe}
        disabled={isLoading || status === "loading"}
        className={cn(
          "relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === "ar" ? "جارٍ التحميل..." : "Loading..."}
          </>
        ) : status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === "ar" ? "التحقق من الجلسة..." : "Checking session..."}
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </>
  );
}
