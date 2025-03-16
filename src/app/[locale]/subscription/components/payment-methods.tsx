"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  locale: string;
}

export function PaymentMethods({ locale }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isRTL = locale === "ar";
  
  // Helper function to get localized text wrapped in useCallback
  const t = useCallback((en: string, ar: string) => {
    return locale === "ar" ? ar : en;
  }, [locale]);
  
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/stripe/payment-methods");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch payment methods");
        }
        
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError(t(
          "Failed to load payment methods. Please try again.",
          "فشل في تحميل طرق الدفع. يرجى المحاولة مرة أخرى."
        ));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [locale, t]);
  
  const handleUpdatePaymentMethod = () => {
    // Redirect to Stripe Customer Portal or a custom payment method update page
    toast({
      title: t("Coming Soon", "قريبًا"),
      description: t(
        "Payment method management will be available soon.",
        "ستكون إدارة طرق الدفع متاحة قريبًا."
      ),
    });
  };
  
  const formatCardBrand = (brand: string) => {
    const brands: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      jcb: "JCB",
      diners: "Diners Club",
      unionpay: "UnionPay",
    };
    
    return brands[brand.toLowerCase()] || brand;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <CardTitle>{t("Payment Method", "طريقة الدفع")}</CardTitle>
        </div>
        <CardDescription>
          {t("Manage your payment methods", "إدارة طرق الدفع الخاصة بك")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-6 text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              {t("Retry", "إعادة المحاولة")}
            </Button>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className={`text-center py-6 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="flex justify-center mb-4">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {t(
                "No payment methods found. Add a payment method to subscribe.",
                "لم يتم العثور على طرق دفع. أضف طريقة دفع للاشتراك."
              )}
            </p>
            <Button className="mt-4" onClick={handleUpdatePaymentMethod}>
              {t("Add Payment Method", "إضافة طريقة دفع")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`flex items-center justify-between border rounded-lg p-4 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex items-center ${isRTL ? "flex-row-reverse space-x-reverse" : ""} space-x-3`}>
                  <CreditCard className="h-5 w-5" />
                  <div className={isRTL ? "mr-3" : "ml-3"}>
                    <p className="font-medium">
                      {formatCardBrand(method.brand)} •••• {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("Expires", "تنتهي الصلاحية")} {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
                  {t("Update", "تحديث")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
