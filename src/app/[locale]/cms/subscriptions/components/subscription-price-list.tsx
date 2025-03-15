"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan, SubscriptionPrice } from "@prisma/client";

interface SubscriptionPriceWithPlan extends SubscriptionPrice {
  plan: SubscriptionPlan & {
    name: string | { en: string; ar: string };
  };
  active?: boolean;
  stripePriceId?: string;
}

interface SubscriptionPriceListProps {
  prices: SubscriptionPriceWithPlan[];
  onEdit: (price: SubscriptionPriceWithPlan) => void;
  onDelete: (priceId: string) => void;
  locale: string;
  isRTL: boolean;
}

export function SubscriptionPriceList({
  prices,
  onEdit,
  onDelete,
  locale,
  isRTL,
}: SubscriptionPriceListProps) {
  const [priceToDelete, setPriceToDelete] = useState<SubscriptionPriceWithPlan | null>(null);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Parse JSON string to object
  const parseJson = (jsonString: string | { en: string; ar: string } | null | undefined) => {
    if (!jsonString) return { en: "", ar: "" };
    
    if (typeof jsonString === 'object') {
      return jsonString;
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { en: "", ar: "" };
    }
  };
  
  // Format price amount
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Get interval display name
  const getIntervalName = (interval: string) => {
    switch (interval) {
      case "monthly":
        return t({ en: "Monthly", ar: "شهري" });
      case "quarterly":
        return t({ en: "3 Months", ar: "3 أشهر" });
      case "annual":
        return t({ en: "Annual", ar: "سنوي" });
      default:
        return interval;
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (priceToDelete) {
      onDelete(priceToDelete.id);
      setPriceToDelete(null);
    }
  };
  
  if (prices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            {t({ 
              en: "No subscription prices found. Create your first price to get started.", 
              ar: "لم يتم العثور على أسعار اشتراك. قم بإنشاء سعرك الأول للبدء." 
            })}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.map((price) => {
          const planName = parseJson(price.plan.name);
          
          return (
            <Card key={price.id} className={cn(
              "flex flex-col",
              !price.active && "opacity-70"
            )}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t(planName)}</CardTitle>
                    <CardDescription>
                      {getIntervalName(price.interval)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">
                          {t({ en: "Open menu", ar: "فتح القائمة" })}
                        </span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(price)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t({ en: "Edit", ar: "تعديل" })}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setPriceToDelete(price)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t({ en: "Delete", ar: "حذف" })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t({ en: "Price", ar: "السعر" })}
                    </h4>
                    <p className="text-2xl font-bold">
                      {formatPrice(price.amount, price.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t({ en: "Status", ar: "الحالة" })}
                    </h4>
                    <Badge variant={price.active ? "default" : "outline"}>
                      {price.active 
                        ? t({ en: "Active", ar: "نشط" })
                        : t({ en: "Inactive", ar: "غير نشط" })
                      }
                    </Badge>
                  </div>
                  
                  {price.stripePriceId && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        {t({ en: "Stripe ID", ar: "معرف Stripe" })}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {price.stripePriceId}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <div className="flex items-center justify-between w-full">
                  <Badge variant="outline">
                    {t({ en: "ID: ", ar: "المعرف: " })}
                    {price.id.substring(0, 8)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(price)}
                  >
                    {t({ en: "Edit", ar: "تعديل" })}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!priceToDelete} onOpenChange={(open) => !open && setPriceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t({ en: "Are you sure?", ar: "هل أنت متأكد؟" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t({ 
                en: "This action cannot be undone. This will permanently delete the subscription price.", 
                ar: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف سعر الاشتراك بشكل دائم." 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={cn(
            "flex",
            isRTL && "flex-row-reverse"
          )}>
            <AlertDialogCancel>
              {t({ en: "Cancel", ar: "إلغاء" })}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t({ en: "Delete", ar: "حذف" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
