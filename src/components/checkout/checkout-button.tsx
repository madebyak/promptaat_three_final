"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
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
  const { data: session, status, update } = useSession();
  
  // Debug session status
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session ? {
      hasUser: !!session.user,
      userEmail: session.user?.email,
      userId: session.user?.id
    } : null);
    
    // Check for cookie presence
    const hasCookies = document.cookie.length > 0;
    console.log("Cookies present:", hasCookies);
    
    // Check for specific session cookie
    const hasSessionCookie = document.cookie.includes("next-auth.session-token") || 
                             document.cookie.includes("__Secure-next-auth.session-token");
    console.log("Session cookie present:", hasSessionCookie);
  }, [session, status]);

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      await update();
      console.log("Session refreshed");
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  }, [update]);

  // Attempt to refresh the session on mount
  useEffect(() => {
    if (status === "authenticated") {
      refreshSession();
    }
  }, [status, refreshSession]);

  const handleSubscribe = async () => {
    console.log("Subscribe clicked, session status:", status);
    console.log("Price ID:", priceId);
    
    if (status === "loading") {
      setError("Please wait while we authenticate your session...");
      return;
    }
    
    if (!session || status !== "authenticated") {
      console.log("No active session, redirecting to login");
      // Store the current URL to redirect back after login
      const callbackUrl = `${window.location.origin}/${locale}/pricing`;
      console.log("Setting callback URL:", callbackUrl);
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

      // Get the origin for API requests
      const apiOrigin = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      const apiUrl = `${apiOrigin}/api/subscriptions`;
      console.log("Using API URL:", apiUrl);

      // Call the API to create a Stripe checkout session
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Critical for sending cookies
        body: JSON.stringify({
          priceId,
        }),
      });

      console.log("API response status:", response.status, response.statusText);
      console.log("Response headers:", {
        contentType: response.headers.get("content-type"),
        cors: response.headers.get("access-control-allow-origin"),
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
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.log("Authentication error detected, attempting to refresh session");
          
          // Try to refresh the session first
          await refreshSession();
          
          if (status === "authenticated") {
            setError(locale === "ar" 
              ? "فشل المصادقة. جاري إعادة المحاولة..." 
              : "Authentication failed. Retrying...");
            
            // Wait a moment and try again
            setTimeout(() => {
              setIsLoading(false);
              setError("");
            }, 2000);
            return;
          } else {
            // If still not authenticated, suggest logging out and back in
            setError(locale === "ar" 
              ? "فشل المصادقة. يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى." 
              : "Authentication failed. Please log out and log in again.");
            
            // Add a logout button
            setTimeout(() => {
              const shouldLogout = window.confirm(
                locale === "ar" 
                  ? "هل تريد تسجيل الخروج الآن؟" 
                  : "Would you like to log out now?"
              );
              
              if (shouldLogout) {
                signOut({ callbackUrl: `${window.location.origin}/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/pricing`)}` });
              }
            }, 1000);
            
            setIsLoading(false);
            return;
          }
        } else {
          throw new Error(`${errorMessage} (${errorCode})`);
        }
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

  const handleLogout = () => {
    signOut({ callbackUrl: `${window.location.origin}/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/pricing`)}` });
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
          {error.includes("log in again") && (
            <button 
              onClick={handleLogout}
              className="ml-2 underline text-blue-500 hover:text-blue-700"
            >
              {locale === "ar" ? "تسجيل الخروج" : "Log out"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
