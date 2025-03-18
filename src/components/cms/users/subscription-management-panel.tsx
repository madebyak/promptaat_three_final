"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  ExternalLink,
  RefreshCw,
  Clock
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Type for subscription data
interface SubscriptionData {
  id: string;
  status: string;
  startDate: string | Date;
  endDate: string | Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  stripePriceId?: string | null;
  plan?: string | null;
  interval?: string | null;
  priceId?: string | null;
}

// Type for user data
interface UserData {
  id: string;
  email: string;
  subscription?: SubscriptionData | null;
}

interface SubscriptionManagementPanelProps {
  user: UserData;
  onSubscriptionUpdated?: () => void;
}

export function SubscriptionManagementPanel({ 
  user, 
  onSubscriptionUpdated 
}: SubscriptionManagementPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [extendLoading, setExtendLoading] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>(
    user.subscription?.status || "inactive"
  );
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date>(
    user.subscription?.currentPeriodEnd 
      ? new Date(user.subscription.currentPeriodEnd) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default to 30 days from now
  );
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>(
    user.subscription?.plan || "pro"
  );
  const [subscriptionInterval, setSubscriptionInterval] = useState<string>(
    user.subscription?.interval || "monthly"
  );
  const [extensionDays, setExtensionDays] = useState<number>(30);
  const [reactivateOnExtend, setReactivateOnExtend] = useState<boolean>(true);

  // Format date for input field
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get badge variant based on subscription status
  const getSubscriptionBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === "active" || normalizedStatus === "trialing") {
      return "default";
    } else if (normalizedStatus === "canceled" || normalizedStatus === "incomplete") {
      return "secondary";
    } else if (normalizedStatus === "incomplete_expired" || normalizedStatus === "unpaid") {
      return "destructive";
    }
    
    return "outline";
  };

  // Handle subscription update
  const handleUpdateSubscription = async () => {
    if (!user.subscription) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/cms/users/${user.id}/subscription`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: subscriptionStatus,
          currentPeriodEnd: subscriptionEndDate.toISOString(),
          plan: subscriptionPlan,
          interval: subscriptionInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update subscription");
      }

      toast({
        title: "Subscription updated",
        description: "The subscription has been successfully updated.",
      });

      // Call the callback if provided
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated();
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle subscription extension
  const handleExtendSubscription = async () => {
    if (!user.subscription) return;
    
    setExtendLoading(true);
    try {
      const response = await fetch(`/api/cms/users/${user.id}/subscription/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extensionDays,
          reactivate: reactivateOnExtend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extend subscription");
      }

      toast({
        title: "Subscription extended",
        description: data.message || `The subscription has been extended by ${extensionDays} days.`,
      });

      // Update the end date in the UI
      setSubscriptionEndDate(new Date(data.subscription.currentPeriodEnd));
      
      // Update status if it was reactivated
      if (reactivateOnExtend && data.subscription.status === "active") {
        setSubscriptionStatus("active");
      }

      // Call the callback if provided
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated();
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast({
        title: "Extension failed",
        description: error instanceof Error ? error.message : "An error occurred while extending the subscription",
        variant: "destructive",
      });
    } finally {
      setExtendLoading(false);
    }
  };

  // Handle sync with Stripe
  const handleSyncWithStripe = async () => {
    if (!user.subscription?.stripeSubscriptionId) {
      toast({
        title: "Sync failed",
        description: "No Stripe subscription ID found",
        variant: "destructive",
      });
      return;
    }
    
    setSyncLoading(true);
    try {
      const response = await fetch(`/api/cms/users/${user.id}/subscription/sync`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync with Stripe");
      }

      // Update local state with synced data
      setSubscriptionStatus(data.subscription.status);
      setSubscriptionEndDate(new Date(data.subscription.currentPeriodEnd));
      
      if (data.subscription.plan) {
        setSubscriptionPlan(data.subscription.plan);
      }
      
      if (data.subscription.interval) {
        setSubscriptionInterval(data.subscription.interval);
      }

      toast({
        title: "Sync successful",
        description: data.message || "The subscription has been synchronized with Stripe.",
      });

      // Call the callback if provided
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated();
      }
    } catch (error) {
      console.error("Error syncing with Stripe:", error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "An error occurred while syncing with Stripe",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  // If no subscription exists, show a message
  if (!user.subscription) {
    return (
      <div className="space-y-4 mt-2 p-4 border rounded-md">
        <p className="text-sm text-muted-foreground">This user has no subscription.</p>
        <Button 
          variant="outline"
          disabled
          className="w-full"
        >
          Create Manual Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="p-4 border rounded-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={getSubscriptionBadgeVariant(subscriptionStatus)} 
              className="capitalize"
            >
              {subscriptionStatus}
            </Badge>
            {user.subscription.cancelAtPeriodEnd && (
              <Badge variant="outline" className="text-xs">
                Cancels at period end
              </Badge>
            )}
          </div>
          
          {user.subscription.stripeSubscriptionId && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 gap-1"
              onClick={handleSyncWithStripe}
              disabled={syncLoading}
            >
              {syncLoading ? <Spinner className="h-4 w-4 mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Sync with Stripe
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subscription-status">Status</Label>
            <Select
              value={subscriptionStatus}
              onValueChange={setSubscriptionStatus}
            >
              <SelectTrigger id="subscription-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <div className="flex items-center">
              <Input
                id="end-date"
                type="date"
                value={formatDateForInput(subscriptionEndDate)}
                onChange={(e) => setSubscriptionEndDate(new Date(e.target.value))}
                className="flex-1"
              />
              <div className="ml-2 text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {Math.ceil((subscriptionEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="subscription-plan">Plan</Label>
            <Select
              value={subscriptionPlan}
              onValueChange={setSubscriptionPlan}
            >
              <SelectTrigger id="subscription-plan">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subscription-interval">Interval</Label>
            <Select
              value={subscriptionInterval}
              onValueChange={setSubscriptionInterval}
            >
              <SelectTrigger id="subscription-interval">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleUpdateSubscription}
          className="w-full"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 h-4 w-4" />}
          Update Subscription
        </Button>
      </div>
      
      <div className="p-4 border rounded-md space-y-4">
        <h4 className="text-sm font-medium">Extend Subscription</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="extension-days">Days to Add</Label>
            <Input
              id="extension-days"
              type="number"
              min="1"
              value={extensionDays}
              onChange={(e) => setExtensionDays(parseInt(e.target.value) || 30)}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center h-10 space-x-2">
              <input
                type="checkbox"
                id="reactivate"
                checked={reactivateOnExtend}
                onChange={(e) => setReactivateOnExtend(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="reactivate" className="text-sm">
                Reactivate if canceled
              </Label>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleExtendSubscription}
          variant="outline"
          className="w-full"
          disabled={extendLoading}
        >
          {extendLoading && <Spinner className="mr-2 h-4 w-4" />}
          Extend Subscription
        </Button>
      </div>
      
      {user.subscription.stripeSubscriptionId && (
        <Accordion type="single" collapsible className="border rounded-md">
          <AccordionItem value="subscription-details" className="border-0">
            <AccordionTrigger className="px-4 py-2">
              <span className="text-sm font-medium">Subscription Details</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Stripe ID:</span>
                  <span className="truncate">{user.subscription.stripeSubscriptionId || "N/A"}</span>
                  
                  <span className="font-medium">Customer ID:</span>
                  <span className="truncate">{user.subscription.stripeCustomerId || "N/A"}</span>
                  
                  <span className="font-medium">Price ID:</span>
                  <span className="truncate">{user.subscription.stripePriceId || "N/A"}</span>
                  
                  <span className="font-medium">Plan:</span>
                  <span>{user.subscription.plan || "N/A"}</span>
                  
                  <span className="font-medium">Interval:</span>
                  <span>{user.subscription.interval || "N/A"}</span>
                  
                  <span className="font-medium">Auto Renew:</span>
                  <span>{user.subscription.cancelAtPeriodEnd ? "No" : "Yes"}</span>
                  
                  <span className="font-medium">Start Date:</span>
                  <span>{formatDate(user.subscription.startDate || user.subscription.currentPeriodStart || new Date())}</span>
                </div>
                
                {user.subscription.stripeSubscriptionId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://dashboard.stripe.com/subscriptions/${user.subscription?.stripeSubscriptionId}`, '_blank')}
                    className="mt-2 w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Stripe Dashboard
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
