"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  url: string;
}

interface BillingHistoryProps {
  locale: string;
  hasActiveSubscription: boolean;
}

export function BillingHistory({ locale, hasActiveSubscription }: BillingHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRTL = locale === "ar";
  
  // Helper function to get localized text wrapped in useCallback
  const t = useCallback((en: string, ar: string) => {
    return locale === "ar" ? ar : en;
  }, [locale]);
  
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!hasActiveSubscription) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/stripe/invoices");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch invoices");
        }
        
        const data = await response.json();
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError(t(
          "Failed to load billing history. Please try again.",
          "فشل في تحميل سجل الفوترة. يرجى المحاولة مرة أخرى."
        ));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoices();
  }, [locale, hasActiveSubscription, t]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500">
            {t("Paid", "مدفوع")}
          </Badge>
        );
      case "open":
        return (
          <Badge variant="outline">
            {t("Unpaid", "غير مدفوع")}
          </Badge>
        );
      case "void":
        return (
          <Badge variant="outline" className="bg-gray-200">
            {t("Void", "ملغي")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <CardTitle>{t("Billing History", "سجل الفوترة")}</CardTitle>
        </div>
        <CardDescription>
          {t("View your billing history and invoices", "عرض سجل الفوترة والفواتير الخاصة بك")}
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
        ) : !hasActiveSubscription ? (
          <div className={`text-center py-6 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="flex justify-center mb-4">
              <Receipt className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {t(
                "Subscribe to view your billing history.",
                "اشترك لعرض سجل الفوترة الخاص بك."
              )}
            </p>
          </div>
        ) : invoices.length === 0 ? (
          <div className={`text-center py-6 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="flex justify-center mb-4">
              <Receipt className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {t(
                "No billing history found.",
                "لم يتم العثور على سجل فوترة."
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {t("Date", "التاريخ")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {t("Invoice", "الفاتورة")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {t("Amount", "المبلغ")}
                  </TableHead>
                  <TableHead className={isRTL ? "text-right" : "text-left"}>
                    {t("Status", "الحالة")}
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className={isRTL ? "text-right" : "text-left"}>
                      {format(new Date(invoice.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : "text-left"}>
                      {invoice.number}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : "text-left"}>
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : "text-left"}>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className={isRTL ? "text-right" : "text-left"}>
                      <a 
                        href={invoice.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                      >
                        {t("View", "عرض")}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
