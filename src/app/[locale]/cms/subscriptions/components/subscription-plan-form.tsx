"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@prisma/client";

// Form schema for subscription plan
const formSchema = z.object({
  name: z.object({
    en: z.string().min(1, { message: "Name in English is required" }),
    ar: z.string().min(1, { message: "Name in Arabic is required" }),
  }),
  description: z.object({
    en: z.string().min(1, { message: "Description in English is required" }),
    ar: z.string().min(1, { message: "Description in Arabic is required" }),
  }),
  features: z.array(
    z.object({
      en: z.string().min(1, { message: "Feature in English is required" }),
      ar: z.string().min(1, { message: "Feature in Arabic is required" }),
    })
  ).min(1, { message: "At least one feature is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionPlanFormProps {
  plan: SubscriptionPlan | null;
  onSave: (data: FormValues) => void;
  onCancel: () => void;
  locale: string;
  isRTL: boolean;
}

export function SubscriptionPlanForm({
  plan,
  onSave,
  onCancel,
  locale,
  isRTL,
}: SubscriptionPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Parse plan data for form
  const parsePlanData = (plan: SubscriptionPlan | null): FormValues => {
    if (!plan) {
      return {
        name: { en: "", ar: "" },
        description: { en: "", ar: "" },
        features: [{ en: "", ar: "" }],
      };
    }
    
    try {
      const name = JSON.parse(plan.name as string);
      const description = JSON.parse(plan.description as string);
      const features = JSON.parse(plan.features as string);
      
      return {
        name,
        description,
        features,
      };
    } catch (error) {
      console.error("Error parsing plan data:", error);
      return {
        name: { en: "", ar: "" },
        description: { en: "", ar: "" },
        features: [{ en: "", ar: "" }],
      };
    }
  };
  
  // Initialize form with plan data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: parsePlanData(plan),
  });
  
  // Get features field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
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
  
  // Add a new feature field
  const addFeature = () => {
    append({ en: "", ar: "" });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Plan Name */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Name (English)", ar: "الاسم (الإنجليزية)" })}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name.ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Name (Arabic)", ar: "الاسم (العربية)" })}
                </FormLabel>
                <FormControl>
                  <Input placeholder="احترافي" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Plan Description */}
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description.en"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Description (English)", ar: "الوصف (الإنجليزية)" })}
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Access to all premium features" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description.ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t({ en: "Description (Arabic)", ar: "الوصف (العربية)" })}
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="الوصول إلى جميع الميزات المتميزة" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Plan Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>
              {t({ en: "Features", ar: "الميزات" })}
            </FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addFeature}
            >
              {t({ en: "Add Feature", ar: "إضافة ميزة" })}
            </Button>
          </div>
          
          <FormDescription>
            {t({ 
              en: "List the features included in this subscription plan", 
              ar: "قائمة الميزات المضمنة في خطة الاشتراك هذه" 
            })}
          </FormDescription>
          
          {fields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name={`features.${index}.en`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Feature in English" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`features.${index}.ar`}
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input 
                          placeholder="الميزة بالعربية" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => remove(index)}
                  >
                    {t({ en: "Remove", ar: "إزالة" })}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
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
