# Promptaat Subscription System: Complete Implementation Plan

## Part 3: CMS Subscription Management

### 6. CMS User Subscription Management

#### 6.1 Create User Subscription Management Page
Add a new page in the CMS to manage user subscriptions:

```typescript
// src/app/[locale]/cms/user-subscriptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CMSLayout } from "@/components/layouts/cms-layout";
import { format } from "date-fns";
import { UserSubscriptionForm } from "./components/user-subscription-form";
import { Search, Plus, RefreshCw } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface SubscriptionPlan {
  id: string;
  name: string; // JSON string
}

interface SubscriptionPrice {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  plan: SubscriptionPlan;
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

export default function UserSubscriptionsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
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
  
  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/cms/user-subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }
      
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({
          en: "Failed to load subscriptions. Please try again.",
          ar: "فشل تحميل الاشتراكات. يرجى المحاولة مرة أخرى."
        }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on initial render
  useEffect(() => {
    fetchSubscriptions();
  }, []);
  
  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subscription.user.email.toLowerCase().includes(searchLower) ||
      subscription.user.firstName.toLowerCase().includes(searchLower) ||
      subscription.user.lastName.toLowerCase().includes(searchLower) ||
      subscription.status.toLowerCase().includes(searchLower)
    );
  });
  
  // Handle form submission
  const handleSubscriptionSave = async (data: any) => {
    try {
      const endpoint = "/api/cms/user-subscriptions";
      const method = selectedSubscription ? "PUT" : "POST";
      const body = selectedSubscription
        ? JSON.stringify({ ...data, id: selectedSubscription.id })
        : JSON.stringify(data);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save subscription");
      }
      
      toast({
        title: t({ en: "Success", ar: "نجاح" }),
        description: t({
          en: "Subscription saved successfully",
          ar: "تم حفظ الاشتراك بنجاح"
        }),
      });
      
      // Refresh data and close form
      fetchSubscriptions();
      setShowForm(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({
          en: "Failed to save subscription. Please try again.",
          ar: "فشل حفظ الاشتراك. يرجى المحاولة مرة أخرى."
        }),
        variant: "destructive",
      });
    }
  };
  
  return (
    <CMSLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {t({ en: "User Subscriptions", ar: "اشتراكات المستخدمين" })}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchSubscriptions}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setSelectedSubscription(null);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: "Add Subscription", ar: "إضافة اشتراك" })}
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t({ en: "Search Subscriptions", ar: "بحث عن الاشتراكات" })}
            </CardTitle>
            <CardDescription>
              {t({
                en: "Search by user email, name, or subscription status",
                ar: "البحث عن طريق البريد الإلكتروني للمستخدم أو الاسم أو حالة الاشتراك"
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({
                  en: "Search subscriptions...",
                  ar: "البحث عن الاشتراكات..."
                })}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        
        {showForm ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {selectedSubscription
                  ? t({ en: "Edit Subscription", ar: "تعديل الاشتراك" })
                  : t({ en: "Add Subscription", ar: "إضافة اشتراك" })}
              </CardTitle>
              <CardDescription>
                {t({
                  en: "Manage user subscription details",
                  ar: "إدارة تفاصيل اشتراك المستخدم"
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSubscriptionForm
                subscription={selectedSubscription}
                onSave={handleSubscriptionSave}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedSubscription(null);
                }}
                locale={locale}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {t({ en: "All Subscriptions", ar: "جميع الاشتراكات" })}
              </CardTitle>
              <CardDescription>
                {t({
                  en: "Manage and view all user subscriptions",
                  ar: "إدارة وعرض جميع اشتراكات المستخدمين"
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm
                    ? t({
                        en: "No subscriptions found matching your search",
                        ar: "لم يتم العثور على اشتراكات تطابق بحثك"
                      })
                    : t({
                        en: "No subscriptions found",
                        ar: "لم يتم العثور على اشتراكات"
                      })}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t({ en: "User", ar: "المستخدم" })}
                        </TableHead>
                        <TableHead>
                          {t({ en: "Plan", ar: "الخطة" })}
                        </TableHead>
                        <TableHead>
                          {t({ en: "Status", ar: "الحالة" })}
                        </TableHead>
                        <TableHead>
                          {t({ en: "Period End", ar: "نهاية الفترة" })}
                        </TableHead>
                        <TableHead>
                          {t({ en: "Actions", ar: "الإجراءات" })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">
                              {subscription.user.firstName} {subscription.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {subscription.user.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscription.price?.plan ? (
                              <div>
                                {t(parseJsonString(subscription.price.plan.name))}
                                <div className="text-sm text-muted-foreground">
                                  {(subscription.price.amount / 100).toFixed(2)} {subscription.price.currency.toUpperCase()} / {subscription.price.interval}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                {t({ en: "No plan", ar: "لا توجد خطة" })}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                subscription.status === "active"
                                  ? "success"
                                  : subscription.status === "canceled"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(subscription.currentPeriodEnd), "PPP")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowForm(true);
                                }}
                              >
                                {t({ en: "Edit", ar: "تعديل" })}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CMSLayout>
  );
}
```
