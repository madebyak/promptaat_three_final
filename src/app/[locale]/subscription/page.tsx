import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma/client"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { CheckoutButton } from "@/components/checkout/checkout-button"
import { cn } from "@/lib/utils"
import { SubscriptionStatusCard } from "@/app/[locale]/subscription/components/subscription-status-card"
import { PaymentMethods } from "@/app/[locale]/subscription/components/payment-methods"
import { BillingHistory } from "@/app/[locale]/subscription/components/billing-history"

// Define interfaces that match the Prisma schema
interface SubscriptionPrice {
  id: string;
  planId: string;
  interval: string;
  amount: number;
  currency: string;
  active: boolean;
  name: string;
  description: string;
  stripePriceId: string;
}

interface SubscriptionModel {
  id: string;
  userId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  price?: SubscriptionPrice;
}

interface SubscriptionPageProps {
  params: {
    locale: string;
  };
}

export default async function SubscriptionPage({ params: { locale } }: SubscriptionPageProps) {
  const t = await getTranslations("Subscription");
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  
  // Fetch the user's subscriptions from the database
  const subscriptions: SubscriptionModel[] = [];
  
  try {
    // Use Prisma's built-in query capabilities instead of raw SQL
    const subscriptionsData = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        // Include the related price data
        price: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Map the data to our SubscriptionModel interface
    subscriptionsData.forEach((subscription) => {
      // Handle the price relationship, which might be null
      const price = subscription.price ? {
        id: subscription.price.id,
        planId: subscription.price.planId,
        interval: subscription.price.interval,
        amount: subscription.price.amount,
        currency: subscription.price.currency,
        active: true, // We assume active is true since it's included in the response
        // @ts-expect-error - name field exists at runtime but not in TypeScript types
        name: subscription.price.name || "",
        // @ts-expect-error - description field exists at runtime but not in TypeScript types
        description: subscription.price.description || "",
        // @ts-expect-error - stripePriceId field exists at runtime but not in TypeScript types
        stripePriceId: subscription.price.stripePriceId,
      } : undefined;
      
      // Push the mapped subscription to our array
      subscriptions.push({
        id: subscription.id,
        userId: subscription.userId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        stripeSubscriptionId: subscription.stripeSubscriptionId || "",
        stripeCustomerId: subscription.stripeCustomerId || "",
        stripePriceId: subscription.stripePriceId || "",
        price,
      });
    });
    
    // Fetch all active subscription prices
    const prices = await prisma.subscriptionPrice.findMany({
      where: {
        // The 'active' field might not be in the Prisma schema, so we'll filter in memory instead
      },
      orderBy: {
        amount: 'asc',
      },
    });
    
    // Filter active prices in memory if needed
    const activeSubscriptionPrices = prices.filter(price => {
      // @ts-expect-error - Handle 'active' field which might exist at runtime but not in TypeScript types
      return price.active !== false;
    });
    
    // Group prices by interval
    const pricesByInterval: Record<string, SubscriptionPrice[]> = {};
    
    activeSubscriptionPrices.forEach((price) => {
      if (!pricesByInterval[price.interval]) {
        pricesByInterval[price.interval] = [];
      }
      
      pricesByInterval[price.interval].push({
        id: price.id,
        planId: price.planId,
        interval: price.interval,
        amount: price.amount,
        currency: price.currency,
        active: true, // We assume active is true since we filtered for it
        // Use optional chaining and nullish coalescing for fields that might not be in the schema
        // @ts-expect-error - Handle fields that might exist at runtime but not in TypeScript types
        name: price.name || "",
        // @ts-expect-error - Handle fields that might exist at runtime but not in TypeScript types
        description: price.description || "",
        // @ts-expect-error - Handle fields that might exist at runtime but not in TypeScript types
        stripePriceId: price.stripePriceId || "",
      });
    });
    
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          
          <Separator />
          
          {subscriptions.length > 0 ? (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
                <TabsTrigger value="payment-method">{t("tabs.paymentMethod")}</TabsTrigger>
                <TabsTrigger value="billing-history">{t("tabs.billingHistory")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 pt-6">
                {subscriptions.map((subscription) => (
                  <SubscriptionStatusCard 
                    key={subscription.id} 
                    subscription={{
                      id: subscription.id,
                      status: subscription.status,
                      currentPeriodEnd: subscription.currentPeriodEnd,
                      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                      stripeSubscriptionId: subscription.stripeSubscriptionId,
                    }}
                    locale={locale}
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="payment-method" className="pt-6">
                <PaymentMethods locale={locale} />
              </TabsContent>
              
              <TabsContent value="billing-history" className="pt-6">
                <BillingHistory 
                  locale={locale} 
                  hasActiveSubscription={subscriptions.some(sub => sub.status === "active")}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-2">{t("chooseYourPlan")}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t("choosePlanDescription")}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Monthly Plan */}
                <Card className={cn("flex flex-col overflow-hidden")}>
                  <CardHeader className="pb-0">
                    <CardTitle>{t("plans.monthly.title")}</CardTitle>
                    <CardDescription>{t("plans.monthly.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <div className="flex items-baseline text-2xl font-bold">
                      $9.99
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        /{t("period.month")}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.allPremiumPrompts")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.unlimitedAccess")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.prioritySupport")}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <CheckoutButton
                      priceId="price_1OoMzMFwQOsgnPVVXkZcuDCN"
                      locale={locale}
                      className="w-full"
                    >
                      {t("subscribe")}
                    </CheckoutButton>
                  </CardFooter>
                </Card>
                
                {/* Quarterly Plan */}
                <Card className={cn("flex flex-col overflow-hidden border-primary")}>
                  <div className="bg-primary py-1 text-center text-xs font-bold text-primary-foreground">
                    {t("popular")}
                  </div>
                  <CardHeader className="pb-0">
                    <CardTitle>{t("plans.quarterly.title")}</CardTitle>
                    <CardDescription>{t("plans.quarterly.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <div className="flex items-baseline text-2xl font-bold">
                      $26.99
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        /{t("period.quarter")}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.allPremiumPrompts")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.unlimitedAccess")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.prioritySupport")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.saveEleven")}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <CheckoutButton
                      priceId="price_1OoMzuFwQOsgnPVVPXJvvYFz"
                      locale={locale}
                      className="w-full"
                    >
                      {t("subscribe")}
                    </CheckoutButton>
                  </CardFooter>
                </Card>
                
                {/* Annual Plan */}
                <Card className={cn("flex flex-col overflow-hidden")}>
                  <div className="bg-amber-500 py-1 text-center text-xs font-bold text-white">
                    {t("bestValue")}
                  </div>
                  <CardHeader className="pb-0">
                    <CardTitle>{t("plans.annual.title")}</CardTitle>
                    <CardDescription>{t("plans.annual.description")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-6">
                    <div className="flex items-baseline text-2xl font-bold">
                      $99.99
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        /{t("period.year")}
                      </span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.allPremiumPrompts")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.unlimitedAccess")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.prioritySupport")}</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{t("features.saveTwenty")}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <CheckoutButton
                      priceId="price_1OoN0OFwQOsgnPVVVzYesjbR"
                      locale={locale}
                      className="w-full"
                    >
                      {t("subscribe")}
                    </CheckoutButton>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    
    // Return a fallback UI with error message
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          
          <Separator />
          
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-500 mb-2">{t("errorTitle") || "Something went wrong"}</h2>
              <p className="text-muted-foreground mb-4">
                {t("errorDescription") || "We couldn't load your subscription information. Please try again later."}
              </p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                {t("tryAgain") || "Try Again"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
