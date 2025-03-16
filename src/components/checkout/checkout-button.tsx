"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: locale === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please sign in first",
        variant: "destructive",
      });
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/pricing`);
      setIsLoading(false);
      return;
    }

    try {
      // Enhanced validation and logging for priceId
      if (!priceId) {
        console.error("Missing priceId in checkout button");
        setError("Missing price ID");
        setIsLoading(false);
        return;
      }

      // Log the price ID for debugging
      console.log("Checkout attempted with:", {
        priceId,
        isValid: priceId.startsWith('price_'),
        length: priceId.length
      });

      // Basic validation for Stripe price ID format
      if (!priceId.startsWith('price_')) {
        console.error("Invalid price ID format:", priceId);
        setError("Invalid price ID format");
        setIsLoading(false);
        return;
      }

      // Track checkout button click
      console.log("Tracking checkout:", {
        userId: session?.user?.id,
      });

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

      if (!response.ok) {
        // Enhanced error handling with full response text
        let errorText = "";
        try {
          // Try to get the full response text for troubleshooting
          errorText = await response.text();
          console.error("Raw error response:", errorText);
          
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          console.error("Checkout error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error || "Unknown error",
            message: errorData.message || "No message provided",
            priceId,
          });
          setError(errorData.error || "Something went wrong");
        } catch (parseError) {
          // If parsing fails, log the raw response
          console.error("Error parsing response:", parseError);
          console.error("Full response status:", response.status, response.statusText);
          console.error("Raw response body:", errorText);
          setError(`Error ${response.status}: ${response.statusText}`);
        }
        
        setIsLoading(false);
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing success response:", parseError);
        setError("Error processing checkout response");
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned from API");
        throw new Error("No checkout URL was provided");
      }
    } catch (error) {
      console.error("Checkout button error:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={isLoading || !session}
        className={cn(
          "relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
          props.className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {locale === "ar" ? "جارٍ المعالجة..." : "Processing..."}
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <div className="mt-2 p-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          Error: {error}
        </div>
      )}
    </>
  );
}
