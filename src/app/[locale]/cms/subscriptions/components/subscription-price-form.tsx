"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan, SubscriptionPrice } from "@prisma/client";

// Extended SubscriptionPrice interface with additional fields
interface ExtendedSubscriptionPrice extends SubscriptionPrice {
  stripePriceId?: string;
  active?: boolean;
}

// Form schema for subscription price
const formSchema = z.object({
  planId: z.string().min(1, { message: "Plan is required" }),
  interval: z.enum(["monthly", "quarterly", "annual"], {
    required_error: "Interval is required",
  }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  stripePriceId: z.string().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionPriceFormProps {
  price: ExtendedSubscriptionPrice | null;
  plans: SubscriptionPlan[];
  onSave: (data: FormValues) => void;
  onCancel: () => void;
  locale: string;
  isRTL: boolean;
}

export function SubscriptionPriceForm({
  price,
  plans,
  onSave,
  onCancel,
  locale,
  isRTL,
}: SubscriptionPriceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Get plan name based on ID
  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return "";
    
    try {
      const nameObj = JSON.parse(plan.name as string);
      return locale === "ar" ? nameObj.ar : nameObj.en;
    } catch (error) {
      console.error("Error parsing plan name:", error);
      return "";
    }
  };
  
  // Initialize form with price data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: price?.planId || "",
      interval: (price?.interval as "monthly" | "quarterly" | "annual") || "monthly",
      amount: price?.amount || 0,
      currency: price?.currency || "USD",
      stripePriceId: price?.stripePriceId || "",
      active: price?.active ?? true,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Plan Selection */}
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "Subscription Plan", ar: "خطة الاشتراك" })}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ 
                      en: "Select a plan", 
                      ar: "اختر خطة" 
                    })} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {getPlanName(plan.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Interval Selection */}
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "Billing Interval", ar: "فترة الفوترة" })}
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ 
                      en: "Select an interval", 
                      ar: "اختر فترة" 
                    })} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">
                    {getIntervalName("monthly")}
                  </SelectItem>
                  <SelectItem value="quarterly">
                    {getIntervalName("quarterly")}
                  </SelectItem>
                  <SelectItem value="annual">
                    {getIntervalName("annual")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Price Amount */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Amount", ar: "المبلغ" })}
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="14.99" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  {t({ 
                    en: "Price amount in the specified currency", 
                    ar: "مبلغ السعر بالعملة المحددة" 
                  })}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Currency", ar: "العملة" })}
                </FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ 
                        en: "Select a currency", 
                        ar: "اختر عملة" 
                      })} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Stripe Price ID */}
        <FormField
          control={form.control}
          name="stripePriceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "Stripe Price ID", ar: "معرف السعر في Stripe" })}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="price_1234567890" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                {t({ 
                  en: "The ID of the price in Stripe (optional for now, required for production)", 
                  ar: "معرف السعر في Stripe (اختياري الآن، مطلوب للإنتاج)" 
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Active Status */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {t({ en: "Active", ar: "نشط" })}
                </FormLabel>
                <FormDescription>
                  {t({ 
                    en: "Make this price available for purchase", 
                    ar: "جعل هذا السعر متاحًا للشراء" 
                  })}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {/* Form Actions */}
        <div className={cn(
          "flex justify-end gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t({ en: "Save", ar: "حفظ" })}
          </Button>
        </div>
      </form>
    </Form>
  );
}
