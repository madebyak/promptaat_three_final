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

interface RawSubscriptionData {
  "subscription.id": string;
  "subscription.userId": string;
  "subscription.status": string;
  "subscription.currentPeriodStart": Date;
  "subscription.currentPeriodEnd": Date;
  "subscription.cancelAtPeriodEnd": boolean;
  "subscription.createdAt": Date;
  "subscription.updatedAt": Date;
  "subscription.stripeSubscriptionId": string;
  "subscription.stripeCustomerId": string;
  "subscription.stripePriceId": string;
  "price.id": string | null;
  "price.planId": string | null;
  "price.interval": string | null;
  "price.amount": number | null;
  "price.currency": string | null;
  "price.active": boolean | null;
  "price.name": string | null;
  "price.description": string | null;
  "price.stripePriceId": string | null;
}

interface SubscriptionPageProps {
  params: {
    locale: string;
  };
}

// Define a type for the raw subscription price data from the database
interface RawSubscriptionPriceData {
  id: string;
  planId: string;
  interval: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  intervalCount: number;
  name: string | null;
  description: string | null;
  stripePriceId: string;
  active: boolean;
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
    // Use a raw query to join the subscription and price tables
    const rawSubscriptions = await prisma.$queryRaw<RawSubscriptionData[]>`
      SELECT 
        subscription.id as "subscription.id",
        subscription.userId as "subscription.userId",
        subscription.status as "subscription.status",
        subscription.currentPeriodStart as "subscription.currentPeriodStart",
        subscription.currentPeriodEnd as "subscription.currentPeriodEnd",
        subscription.cancelAtPeriodEnd as "subscription.cancelAtPeriodEnd",
        subscription.createdAt as "subscription.createdAt",
        subscription.updatedAt as "subscription.updatedAt",
        subscription.stripeSubscriptionId as "subscription.stripeSubscriptionId",
        subscription.stripeCustomerId as "subscription.stripeCustomerId",
        subscription.stripePriceId as "subscription.stripePriceId",
        price.id as "price.id",
        price.planId as "price.planId",
        price.interval as "price.interval",
        price.amount as "price.amount",
        price.currency as "price.currency",
        price.active as "price.active",
        price.name as "price.name",
        price.description as "price.description",
        price.stripePriceId as "price.stripePriceId"
      FROM "Subscription" subscription
      LEFT JOIN "SubscriptionPrice" price ON subscription.stripePriceId = price.stripePriceId
      WHERE subscription.userId = ${session.user.id}
      ORDER BY subscription.createdAt DESC
    `;
    
    // Map the raw data to the SubscriptionModel interface
    rawSubscriptions.forEach((row: RawSubscriptionData) => {
      const price = row["price.id"] ? {
        id: row["price.id"] as string,
        planId: row["price.planId"] as string,
        interval: row["price.interval"] as string,
        amount: row["price.amount"] as number,
        currency: row["price.currency"] as string,
        active: row["price.active"] as boolean,
        name: row["price.name"] as string,
        description: row["price.description"] as string,
        stripePriceId: row["price.stripePriceId"] as string,
      } : undefined;
      
      subscriptions.push({
        id: row["subscription.id"],
        userId: row["subscription.userId"],
        status: row["subscription.status"],
        currentPeriodStart: row["subscription.currentPeriodStart"],
        currentPeriodEnd: row["subscription.currentPeriodEnd"],
        cancelAtPeriodEnd: row["subscription.cancelAtPeriodEnd"],
        createdAt: row["subscription.createdAt"],
        updatedAt: row["subscription.updatedAt"],
        stripeSubscriptionId: row["subscription.stripeSubscriptionId"],
        stripeCustomerId: row["subscription.stripeCustomerId"],
        stripePriceId: row["subscription.stripePriceId"],
        price,
      });
    });
    
    // Fetch all subscription prices
    // Note: We're using a raw query to avoid TypeScript errors with the 'active' field
    // which exists in the database but not in the Prisma schema
    const rawPrices = await prisma.$queryRaw<RawSubscriptionPriceData[]>`
      SELECT 
        id, 
        "planId", 
        interval, 
        amount, 
        currency, 
        "createdAt", 
        "updatedAt", 
        "intervalCount",
        name,
        description,
        "stripePriceId",
        active
      FROM "SubscriptionPrice"
      WHERE active = true
      ORDER BY amount ASC
    `;
    
    // Group prices by interval
    const pricesByInterval: Record<string, SubscriptionPrice[]> = {};
    
    rawPrices.forEach((price) => {
      if (!pricesByInterval[price.interval]) {
        pricesByInterval[price.interval] = [];
      }
      
      // Cast the price to the SubscriptionPrice interface
      pricesByInterval[price.interval].push({
        id: price.id,
        planId: price.planId,
        interval: price.interval,
        amount: price.amount,
        currency: price.currency,
        active: price.active, 
        name: price.name || "",
        description: price.description || "",
        stripePriceId: price.stripePriceId,
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
                      $79.99
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
                        <span className="text-sm">{t("features.saveThirtyThree")}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <CheckoutButton
                      priceId="price_1OoN0MFwQOsgnPVVXRBDSzjV"
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
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    
    // If there was an error, show an error message
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          
          <Separator />
          
          <Card>
            <CardHeader>
              <CardTitle>{t("errorLoading")}</CardTitle>
              <CardDescription>{t("unableToLoad")}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>
                {t("refresh")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
}
