"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/data/countries";
import { Loader2 } from "lucide-react";

// Define form schema with validation
const profileCompletionSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name cannot exceed 50 characters" }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name cannot exceed 50 characters" }),
  country: z
    .string()
    .min(1, { message: "Country is required" }),
});

type ProfileCompletionFormValues = z.infer<typeof profileCompletionSchema>;

interface ProfileCompletionFormProps {
  locale: string;
  initialData?: {
    firstName?: string;
    lastName?: string;
    country?: string;
  };
  translations: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    country: string;
    pleaseSelect: string;
    submit: string;
    submitting: string;
    successMessage: string;
    errorMessage: string;
  };
}

export function ProfileCompletionForm({
  locale,
  initialData,
  translations,
}: ProfileCompletionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<ProfileCompletionFormValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      country: initialData?.country || "",
    },
  });

  const onSubmit = async (data: ProfileCompletionFormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      // Clear the needs_profile_completion cookie after successful profile update
      document.cookie = "needs_profile_completion=; path=/; max-age=0";

      toast({
        title: translations.successMessage,
        description: new Date().toLocaleString(),
      });

      // Redirect to homepage after successful completion
      setTimeout(() => {
        router.push(`/${locale}`);
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Profile completion error:", error);
      toast({
        title: translations.errorMessage,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{translations.title}</h1>
        <p className="text-sm text-muted-foreground">{translations.subtitle}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.firstName}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={translations.firstName}
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.lastName}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={translations.lastName}
                      {...field}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{translations.country}</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={translations.pleaseSelect} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {locale === 'ar' ? country.labelAr : country.label} {country.flag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translations.submitting}
              </>
            ) : (
              translations.submit
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
