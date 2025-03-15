"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";
import { SubscriptionPlanForm } from "./components/subscription-plan-form";
import { SubscriptionPriceForm } from "./components/subscription-price-form";
import { SubscriptionPlanList } from "./components/subscription-plan-list";
import { SubscriptionPriceList } from "./components/subscription-price-list";
import { SubscriptionPlan, SubscriptionPrice } from "@prisma/client";
import { cn } from "@/lib/utils";
import { CMSLayout } from "@/components/layouts/cms-layout";

type SubscriptionPriceWithPlan = SubscriptionPrice & {
  plan: SubscriptionPlan;
};

export default function SubscriptionsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";
  const { toast } = useToast();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("plans");
  
  // State for plans and prices
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [prices, setPrices] = useState<SubscriptionPriceWithPlan[]>([]);
  
  // State for forms
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<SubscriptionPriceWithPlan | null>(null);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Fetch plans and prices
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch subscription plans
      const plansResponse = await fetch("/api/cms/subscription-plans");
      if (!plansResponse.ok) {
        throw new Error("Failed to fetch subscription plans");
      }
      const plansData = await plansResponse.json();
      setPlans(plansData);
      
      // Fetch subscription prices
      const pricesResponse = await fetch("/api/cms/subscription-prices");
      if (!pricesResponse.ok) {
        throw new Error("Failed to fetch subscription prices");
      }
      const pricesData = await pricesResponse.json();
      setPrices(pricesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({ 
          en: "Failed to load subscription data. Please try again.", 
          ar: "فشل تحميل بيانات الاشتراك. يرجى المحاولة مرة أخرى." 
        }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on initial render
  useEffect(() => {
    fetchData();
  }, []);
  
  // Handle plan form submission
  const handlePlanSave = async (data: any) => {
    try {
      const endpoint = "/api/cms/subscription-plans";
      const method = selectedPlan ? "PUT" : "POST";
      const body = selectedPlan 
        ? JSON.stringify({ ...data, id: selectedPlan.id }) 
        : JSON.stringify(data);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error("Failed to save subscription plan");
      }
      
      // Refresh data
      await fetchData();
      
      // Reset form state
      setShowPlanForm(false);
      setSelectedPlan(null);
      
      // Show success message
      toast({
        title: t({ 
          en: selectedPlan ? "Plan Updated" : "Plan Created", 
          ar: selectedPlan ? "تم تحديث الخطة" : "تم إنشاء الخطة" 
        }),
        description: t({ 
          en: selectedPlan 
            ? "The subscription plan has been updated successfully." 
            : "The subscription plan has been created successfully.", 
          ar: selectedPlan 
            ? "تم تحديث خطة الاشتراك بنجاح." 
            : "تم إنشاء خطة الاشتراك بنجاح." 
        }),
      });
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({ 
          en: "Failed to save subscription plan. Please try again.", 
          ar: "فشل حفظ خطة الاشتراك. يرجى المحاولة مرة أخرى." 
        }),
        variant: "destructive",
      });
    }
  };
  
  // Handle price form submission
  const handlePriceSave = async (data: any) => {
    try {
      const endpoint = "/api/cms/subscription-prices";
      const method = selectedPrice ? "PUT" : "POST";
      const body = selectedPrice 
        ? JSON.stringify({ ...data, id: selectedPrice.id }) 
        : JSON.stringify(data);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error("Failed to save subscription price");
      }
      
      // Refresh data
      await fetchData();
      
      // Reset form state
      setShowPriceForm(false);
      setSelectedPrice(null);
      
      // Show success message
      toast({
        title: t({ 
          en: selectedPrice ? "Price Updated" : "Price Created", 
          ar: selectedPrice ? "تم تحديث السعر" : "تم إنشاء السعر" 
        }),
        description: t({ 
          en: selectedPrice 
            ? "The subscription price has been updated successfully." 
            : "The subscription price has been created successfully.", 
          ar: selectedPrice 
            ? "تم تحديث سعر الاشتراك بنجاح." 
            : "تم إنشاء سعر الاشتراك بنجاح." 
        }),
      });
    } catch (error) {
      console.error("Error saving price:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({ 
          en: "Failed to save subscription price. Please try again.", 
          ar: "فشل حفظ سعر الاشتراك. يرجى المحاولة مرة أخرى." 
        }),
        variant: "destructive",
      });
    }
  };
  
  // Handle plan deletion
  const handlePlanDelete = async (planId: string) => {
    try {
      const response = await fetch(`/api/cms/subscription-plans?id=${planId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete subscription plan");
      }
      
      // Refresh data
      await fetchData();
      
      // Show success message
      toast({
        title: t({ en: "Plan Deleted", ar: "تم حذف الخطة" }),
        description: t({ 
          en: "The subscription plan has been deleted successfully.", 
          ar: "تم حذف خطة الاشتراك بنجاح." 
        }),
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({ 
          en: "Failed to delete subscription plan. Please try again.", 
          ar: "فشل حذف خطة الاشتراك. يرجى المحاولة مرة أخرى." 
        }),
        variant: "destructive",
      });
    }
  };
  
  // Handle price deletion
  const handlePriceDelete = async (priceId: string) => {
    try {
      const response = await fetch(`/api/cms/subscription-prices?id=${priceId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete subscription price");
      }
      
      // Refresh data
      await fetchData();
      
      // Show success message
      toast({
        title: t({ en: "Price Deleted", ar: "تم حذف السعر" }),
        description: t({ 
          en: "The subscription price has been deleted successfully.", 
          ar: "تم حذف سعر الاشتراك بنجاح." 
        }),
      });
    } catch (error) {
      console.error("Error deleting price:", error);
      toast({
        title: t({ en: "Error", ar: "خطأ" }),
        description: t({ 
          en: "Failed to delete subscription price. Please try again.", 
          ar: "فشل حذف سعر الاشتراك. يرجى المحاولة مرة أخرى." 
        }),
        variant: "destructive",
      });
    }
  };
  
  // Handle edit plan
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPlanForm(true);
    setActiveTab("plans");
  };
  
  // Handle edit price
  const handleEditPrice = (price: SubscriptionPriceWithPlan) => {
    setSelectedPrice(price);
    setShowPriceForm(true);
    setActiveTab("prices");
  };
  
  // Handle cancel plan form
  const handleCancelPlanForm = () => {
    setShowPlanForm(false);
    setSelectedPlan(null);
  };
  
  // Handle cancel price form
  const handleCancelPriceForm = () => {
    setShowPriceForm(false);
    setSelectedPrice(null);
  };
  
  // Handle add new plan
  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanForm(true);
  };
  
  // Handle add new price
  const handleAddPrice = () => {
    setSelectedPrice(null);
    setShowPriceForm(true);
  };
  
  return (
    <CMSLayout>
      <div className="container py-10">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t({ en: "Subscription Management", ar: "إدارة الاشتراكات" })}
              </h1>
              <p className="text-muted-foreground">
                {t({ 
                  en: "Manage your subscription plans and prices", 
                  ar: "إدارة خطط وأسعار الاشتراك الخاصة بك" 
                })}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="plans">
                  {t({ en: "Plans", ar: "الخطط" })}
                </TabsTrigger>
                <TabsTrigger value="prices">
                  {t({ en: "Prices", ar: "الأسعار" })}
                </TabsTrigger>
              </TabsList>
              
              <div>
                {activeTab === "plans" && !showPlanForm && (
                  <Button onClick={handleAddPlan}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t({ en: "Add Plan", ar: "إضافة خطة" })}
                  </Button>
                )}
                
                {activeTab === "prices" && !showPriceForm && (
                  <Button onClick={handleAddPrice} disabled={plans.length === 0}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t({ en: "Add Price", ar: "إضافة سعر" })}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <TabsContent value="plans" className="space-y-6">
                {showPlanForm ? (
                  <div className="bg-card p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">
                      {selectedPlan 
                        ? t({ en: "Edit Plan", ar: "تعديل الخطة" })
                        : t({ en: "Create Plan", ar: "إنشاء خطة" })
                      }
                    </h2>
                    <SubscriptionPlanForm 
                      plan={selectedPlan}
                      onSave={handlePlanSave}
                      onCancel={handleCancelPlanForm}
                      locale={locale}
                      isRTL={isRTL}
                    />
                  </div>
                ) : (
                  <SubscriptionPlanList 
                    plans={plans}
                    onEdit={handleEditPlan}
                    onDelete={handlePlanDelete}
                    locale={locale}
                    isRTL={isRTL}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="prices" className="space-y-6">
                {showPriceForm ? (
                  <div className="bg-card p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">
                      {selectedPrice 
                        ? t({ en: "Edit Price", ar: "تعديل السعر" })
                        : t({ en: "Create Price", ar: "إنشاء سعر" })
                      }
                    </h2>
                    <SubscriptionPriceForm 
                      price={selectedPrice}
                      plans={plans}
                      onSave={handlePriceSave}
                      onCancel={handleCancelPriceForm}
                      locale={locale}
                      isRTL={isRTL}
                    />
                  </div>
                ) : (
                  <SubscriptionPriceList 
                    prices={prices}
                    onEdit={handleEditPrice}
                    onDelete={handlePriceDelete}
                    locale={locale}
                    isRTL={isRTL}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </CMSLayout>
  );
}
