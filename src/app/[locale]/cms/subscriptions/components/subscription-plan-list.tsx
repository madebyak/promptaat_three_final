"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@prisma/client";

interface SubscriptionPlanListProps {
  plans: SubscriptionPlan[];
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (planId: string) => void;
  locale: string;
  isRTL: boolean;
}

export function SubscriptionPlanList({
  plans,
  onEdit,
  onDelete,
  locale,
  isRTL,
}: SubscriptionPlanListProps) {
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  
  // Helper function to get localized text
  const t = (obj: { en: string; ar: string }) => {
    return locale === "ar" ? obj.ar : obj.en;
  };
  
  // Parse JSON string to object
  const parseJson = (jsonString: string | null | undefined) => {
    if (!jsonString) return { en: "", ar: "" };
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return { en: "", ar: "" };
    }
  };
  
  // Parse features array
  const parseFeatures = (featuresString: string | null | undefined) => {
    if (!featuresString) return [];
    
    try {
      return JSON.parse(featuresString);
    } catch (error) {
      console.error("Error parsing features:", error);
      return [];
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (planToDelete) {
      onDelete(planToDelete.id);
      setPlanToDelete(null);
    }
  };
  
  // Cancel delete
  const handleDeleteCancel = () => {
    setPlanToDelete(null);
  };
  
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            {t({ 
              en: "No subscription plans found. Create your first plan to get started.", 
              ar: "لم يتم العثور على خطط اشتراك. قم بإنشاء خطتك الأولى للبدء." 
            })}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const name = parseJson(plan.name as string);
          const description = parseJson(plan.description as string);
          const features = parseFeatures(plan.features as string);
          
          return (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>{t(name)}</CardTitle>
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
                      <DropdownMenuItem onClick={() => onEdit(plan)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t({ en: "Edit", ar: "تعديل" })}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setPlanToDelete(plan)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t({ en: "Delete", ar: "حذف" })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{t(description)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {t({ en: "Features", ar: "الميزات" })}
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {features.map((feature: { en: string; ar: string }, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                        {t(feature)}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <div className="flex items-center justify-between w-full">
                  <Badge variant="outline">
                    {t({ en: "ID: ", ar: "المعرف: " })}
                    {plan.id.substring(0, 8)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(plan)}
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
      <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t({ en: "Are you sure?", ar: "هل أنت متأكد؟" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t({ 
                en: "This action cannot be undone. This will permanently delete the subscription plan and all associated data.", 
                ar: "لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف خطة الاشتراك وجميع البيانات المرتبطة بها بشكل دائم." 
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
