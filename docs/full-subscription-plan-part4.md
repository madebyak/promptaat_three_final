# Promptaat Subscription System: Complete Implementation Plan

## Part 4: API Endpoints & Form Components

### 7. User Subscription Form Component

#### 7.1 Create User Subscription Form Component

```typescript
// src/app/[locale]/cms/user-subscriptions/components/user-subscription-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface SubscriptionPrice {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  plan: {
    id: string;
    name: string; // JSON string
  };
}

interface Subscription {
  id: string;
  userId: string;
  user: User;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  price: SubscriptionPrice | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSubscriptionFormProps {
  subscription: Subscription | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  locale: string;
}

// Form schema
const formSchema = z.object({
  userId: z.string().min(1, { message: "User is required" }),
  priceId: z.string().optional(),
  status: z.enum(["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"]),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean().default(false),
});

export function UserSubscriptionForm({
  subscription,
  onSave,
  onCancel,
  locale,
}: UserSubscriptionFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [prices, setPrices] = useState<SubscriptionPrice[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Parse JSON string to object
  const parseJsonString = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { en: "Error", ar: "خطأ" };
    }
  };
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: subscription?.userId || "",
      priceId: subscription?.priceId || undefined,
      status: (subscription?.status as any) || "active",
      currentPeriodStart: subscription?.currentPeriodStart
        ? new Date(subscription.currentPeriodStart)
        : new Date(),
      currentPeriodEnd: subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
    },
  });
  
  // Fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    
    try {
      const response = await fetch("/api/cms/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // Fetch subscription prices
  const fetchPrices = async () => {
    setIsLoadingPrices(true);
    
    try {
      const response = await fetch("/api/cms/subscription-prices");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription prices");
      }
      
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error("Error fetching subscription prices:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  };
  
  // Load data on initial render
  useEffect(() => {
    fetchUsers();
    fetchPrices();
  }, []);
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onSave(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* User Selection */}
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "User", ar: "المستخدم" })}
              </FormLabel>
              <Select
                disabled={isLoadingUsers || !!subscription}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingUsers ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t({ en: "Loading users...", ar: "جاري تحميل المستخدمين..." })}
                      </div>
                    ) : (
                      <SelectValue placeholder={t({ en: "Select a user", ar: "اختر مستخدم" })} />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t({
                  en: "Select the user for this subscription",
                  ar: "اختر المستخدم لهذا الاشتراك"
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Price Selection */}
        <FormField
          control={form.control}
          name="priceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "Subscription Plan", ar: "خطة الاشتراك" })}
              </FormLabel>
              <Select
                disabled={isLoadingPrices}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    {isLoadingPrices ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t({ en: "Loading plans...", ar: "جاري تحميل الخطط..." })}
                      </div>
                    ) : (
                      <SelectValue placeholder={t({ en: "Select a plan", ar: "اختر خطة" })} />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">
                    {t({ en: "No plan (custom)", ar: "بدون خطة (مخصص)" })}
                  </SelectItem>
                  {prices.map((price) => (
                    <SelectItem key={price.id} value={price.id}>
                      {t(parseJsonString(price.plan.name))} - {(price.amount / 100).toFixed(2)} {price.currency.toUpperCase()} / {price.interval}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t({
                  en: "Select the subscription plan or leave empty for a custom subscription",
                  ar: "اختر خطة الاشتراك أو اتركها فارغة لاشتراك مخصص"
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t({ en: "Status", ar: "الحالة" })}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: "Select status", ar: "اختر الحالة" })} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">
                    {t({ en: "Active", ar: "نشط" })}
                  </SelectItem>
                  <SelectItem value="canceled">
                    {t({ en: "Canceled", ar: "ملغى" })}
                  </SelectItem>
                  <SelectItem value="incomplete">
                    {t({ en: "Incomplete", ar: "غير مكتمل" })}
                  </SelectItem>
                  <SelectItem value="incomplete_expired">
                    {t({ en: "Incomplete Expired", ar: "غير مكتمل منتهي" })}
                  </SelectItem>
                  <SelectItem value="past_due">
                    {t({ en: "Past Due", ar: "متأخر" })}
                  </SelectItem>
                  <SelectItem value="trialing">
                    {t({ en: "Trialing", ar: "تجريبي" })}
                  </SelectItem>
                  <SelectItem value="unpaid">
                    {t({ en: "Unpaid", ar: "غير مدفوع" })}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t({
                  en: "Set the current status of the subscription",
                  ar: "تعيين الحالة الحالية للاشتراك"
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Current Period Start */}
        <FormField
          control={form.control}
          name="currentPeriodStart"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t({ en: "Current Period Start", ar: "بداية الفترة الحالية" })}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>
                          {t({ en: "Pick a date", ar: "اختر تاريخ" })}
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t({
                  en: "When the current billing period started",
                  ar: "متى بدأت فترة الفوترة الحالية"
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Current Period End */}
        <FormField
          control={form.control}
          name="currentPeriodEnd"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t({ en: "Current Period End", ar: "نهاية الفترة الحالية" })}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>
                          {t({ en: "Pick a date", ar: "اختر تاريخ" })}
                        </span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                {t({
                  en: "When the current billing period ends",
                  ar: "متى تنتهي فترة الفوترة الحالية"
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Cancel At Period End */}
        <FormField
          control={form.control}
          name="cancelAtPeriodEnd"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t({ en: "Cancel at Period End", ar: "إلغاء في نهاية الفترة" })}
                </FormLabel>
                <FormDescription>
                  {t({
                    en: "The subscription will be canceled at the end of the current billing period",
                    ar: "سيتم إلغاء الاشتراك في نهاية فترة الفوترة الحالية"
                  })}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </Button>
          <Button type="submit">
            {t({ en: "Save", ar: "حفظ" })}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### 8. API Endpoints for Subscription Management

#### 8.1 Create User Subscriptions API Route

```typescript
// src/app/api/cms/user-subscriptions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/client";
import { authOptions } from "@/lib/auth";

// GET: Fetch all user subscriptions
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch all subscriptions with related data
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        price: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST: Create a new subscription
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      userId,
      priceId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        priceId: priceId || null,
        status,
        currentPeriodStart: new Date(currentPeriodStart),
        currentPeriodEnd: new Date(currentPeriodEnd),
        cancelAtPeriodEnd,
      },
    });
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// PUT: Update an existing subscription
export async function PUT(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      id,
      priceId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }
    
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    
    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        priceId: priceId || null,
        status,
        currentPeriodStart: new Date(currentPeriodStart),
        currentPeriodEnd: new Date(currentPeriodEnd),
        cancelAtPeriodEnd,
      },
    });
    
    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a subscription
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse URL to get subscription ID
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }
    
    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
    });
    
    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    
    // Delete subscription
    await prisma.subscription.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
```

### 9. Implementation Plan Summary

#### 9.1 Implementation Steps

1. **Create Utility Functions**
   - Implement `isUserSubscribed` utility function for checking subscription status
   - Add helper functions for subscription management

2. **UI Components**
   - Add Pro badge to navbar, user menu, and profile page
   - Create ProPromptContent wrapper component for blurring premium content
   - Update prompt card and modal components to use the wrapper

3. **API Endpoints**
   - Enhance prompt API routes to check subscription status
   - Create CMS API endpoints for subscription management
   - Implement security measures to prevent unauthorized access

4. **CMS Interface**
   - Build user subscription management page in the CMS
   - Create form components for adding/editing subscriptions
   - Implement user search and filtering functionality

5. **Security Measures**
   - Add client-side protection against web inspector hacking
   - Implement server-side validation for all subscription-related requests
   - Ensure proper authentication checks for accessing premium content

#### 9.2 Testing Plan

1. **Functionality Testing**
   - Verify Pro badge appears correctly for subscribed users
   - Test blur effect on premium prompts for non-subscribers
   - Ensure copy functionality is disabled for premium prompts for non-subscribers
   - Test subscription management in the CMS

2. **Security Testing**
   - Attempt to access premium content via direct API calls
   - Test protection against web inspector hacking
   - Verify authentication and authorization checks

3. **User Experience Testing**
   - Test the subscription flow from free user to Pro
   - Ensure proper redirects to subscription page
   - Verify visual elements are consistent across themes

4. **Performance Testing**
   - Measure impact of subscription checks on page load times
   - Ensure CMS subscription management performs well with large datasets

#### 9.3 Deployment Considerations

1. **Database Updates**
   - Ensure proper migration for any schema changes
   - Backup data before deployment

2. **Rollout Strategy**
   - Deploy changes incrementally to minimize risk
   - Monitor error rates and user feedback after deployment

3. **Documentation**
   - Update internal documentation with new features
   - Create user guides for the subscription system
   - Document API changes for developers
