'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { ReactivateSubscriptionButton } from "@/components/subscription/reactivate-subscription-button";
import { useState } from "react";

interface SubscriptionStatusCardProps {
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId: string;
  };
  locale?: string;
}

export function SubscriptionStatusCard({ 
  subscription, 
  locale = 'en' 
}: SubscriptionStatusCardProps) {
  const [isCanceled, setIsCanceled] = useState(subscription.cancelAtPeriodEnd);
  
  const isActive = subscription.status === 'active' && 
                   new Date(subscription.currentPeriodEnd) > new Date();
  
  const getBadgeVariant = () => {
    if (!isActive) return "outline";
    if (isCanceled) return "secondary";
    return "secondary";
  };
  
  const getBadgeText = () => {
    if (!isActive) return locale === 'ar' ? "غير نشط" : "Inactive";
    if (isCanceled) return locale === 'ar' ? "سيتم إلغاؤه" : "Canceling";
    return locale === 'ar' ? "نشط" : "Active";
  };
  
  const handleCancellationSuccess = () => {
    setIsCanceled(true);
  };
  
  const handleReactivationSuccess = () => {
    setIsCanceled(false);
  };
  
  const formattedEndDate = format(new Date(subscription.currentPeriodEnd), 'MMMM dd, yyyy');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>
          {locale === 'ar' ? 'حالة الاشتراك' : 'Subscription Status'}
        </CardTitle>
        <CardDescription>
          {locale === 'ar' ? 'حالة اشتراكك الحالي' : 'Your current subscription status'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={getBadgeVariant()}>
                {getBadgeText()}
              </Badge>
            </div>
            
            {isActive && (
              isCanceled ? (
                <ReactivateSubscriptionButton
                  subscriptionId={subscription.stripeSubscriptionId}
                  onReactivationSuccess={handleReactivationSuccess}
                  locale={locale}
                />
              ) : (
                <CancelSubscriptionButton
                  subscriptionId={subscription.stripeSubscriptionId}
                  currentPeriodEnd={subscription.currentPeriodEnd}
                  onCancellationSuccess={handleCancellationSuccess}
                  locale={locale}
                />
              )
            )}
          </div>
          
          {isCanceled && isActive && (
            <div className="text-sm text-muted-foreground mt-2 p-2 border rounded-md bg-muted/50">
              {locale === 'ar' 
                ? `سيتم إلغاء اشتراكك في ${formattedEndDate}. ستظل تتمتع بإمكانية الوصول الكامل حتى ذلك التاريخ.`
                : `Your subscription will cancel on ${formattedEndDate}. You'll have full access until then.`
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
