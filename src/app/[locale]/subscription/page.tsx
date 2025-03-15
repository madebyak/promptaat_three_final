import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma/client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Package } from "lucide-react"
import { SubscriptionStatusCard } from "@/components/subscription/subscription-status-card"

// Define interfaces that match the Prisma schema
interface SubscriptionPrice {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionModel {
  id: string;
  userId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string | null;
  price: SubscriptionPrice | null;
  createdAt: Date;
  updatedAt: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  plan?: string;
  interval?: string;
}

// Define types for raw query results
interface RawSubscriptionData {
  id: string;
  user_id: string;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  price_id: string | null;
  created_at: Date;
  updated_at: Date;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_price_id?: string;
  plan?: string;
  interval?: string;
  "price.id"?: string;
  "price.planId"?: string;
  "price.amount"?: number;
  "price.currency"?: string;
  "price.interval"?: string;
  "price.intervalCount"?: number;
  "price.createdAt"?: Date;
  "price.updatedAt"?: Date;
}

// Debug helper
const DEBUG = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('[SubscriptionPage]', ...args);
  }
};

interface SubscriptionPageProps {
  params: {
    locale: string;
  };
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale || 'en';

  if (!session) {
    redirect("/login")
  }

  try {
    // Fetch user with subscription
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    debugLog('User found:', user.id);

    // Fetch subscriptions with price relation using raw SQL query
    // This approach bypasses TypeScript errors with Prisma's include
    const subscriptionsRaw = await prisma.$queryRaw`
      SELECT 
        s.*,
        p.id as "price.id",
        p.plan_id as "price.planId",
        p.amount as "price.amount",
        p.currency as "price.currency",
        p.interval as "price.interval",
        p.interval_count as "price.intervalCount",
        p.created_at as "price.createdAt",
        p.updated_at as "price.updatedAt"
      FROM subscriptions s
      LEFT JOIN subscription_prices p ON s.price_id = p.id
      WHERE s.user_id = ${user.id}
      ORDER BY s.created_at DESC
    `;

    // Process raw query results to match our interface
    const subscriptions = (subscriptionsRaw as RawSubscriptionData[]).map((row: RawSubscriptionData) => {
      // Extract price data if it exists
      const price = row["price.id"] ? {
        id: row["price.id"],
        planId: row["price.planId"] || "",
        amount: row["price.amount"] || 0,
        currency: row["price.currency"] || "",
        interval: row["price.interval"] || "",
        intervalCount: row["price.intervalCount"] || 0,
        createdAt: row["price.createdAt"] || new Date(),
        updatedAt: row["price.updatedAt"] || new Date()
      } : null;

      // Return subscription with properly formatted data
      return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        currentPeriodStart: row.current_period_start,
        currentPeriodEnd: row.current_period_end,
        cancelAtPeriodEnd: row.cancel_at_period_end,
        priceId: row.price_id,
        price,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        stripeSubscriptionId: row.stripe_subscription_id,
        stripeCustomerId: row.stripe_customer_id,
        stripePriceId: row.stripe_price_id,
        plan: row.plan || (price?.interval === "month" ? "monthly" : "annual"),
        interval: row.interval || price?.interval || "month"
      } as SubscriptionModel;
    });

    debugLog('Subscriptions:', subscriptions);

    // Check if user has an active subscription
    const activeSubscription = subscriptions.length > 0 ? subscriptions[0] : null;
    
    const isSubscribed = activeSubscription && 
                         activeSubscription.status === 'active' && 
                         (new Date(activeSubscription.currentPeriodEnd) > new Date());

    debugLog('Active subscription:', activeSubscription);
    debugLog('Is subscribed:', isSubscribed);

    return (
      <div className="container max-w-6xl py-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and billing information.
            </p>
          </div>
          <Separator />
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
              <TabsTrigger value="billing-history">Billing History</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isSubscribed && activeSubscription && (
                  <SubscriptionStatusCard
                    subscription={{
                      id: activeSubscription.id,
                      status: activeSubscription.status,
                      currentPeriodEnd: activeSubscription.currentPeriodEnd,
                      cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
                      stripeSubscriptionId: activeSubscription.stripeSubscriptionId || "",
                    }}
                    locale={locale}
                  />
                )}
                {isSubscribed && activeSubscription && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Billing Cycle</CardTitle>
                      <CardDescription>
                        Your billing cycle information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {activeSubscription.interval === "month" ? "Monthly" : "Yearly"} billing
                      </div>
                      <div className="mt-2 font-medium">
                        {activeSubscription.price?.amount
                          ? `$${(activeSubscription.price.amount / 100).toFixed(2)} / ${
                              activeSubscription.price.interval
                            }`
                          : "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {isSubscribed && activeSubscription && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Next Billing Date</CardTitle>
                      <CardDescription>
                        Your next billing date
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="font-medium">
                        {activeSubscription.currentPeriodEnd
                          ? format(
                              new Date(activeSubscription.currentPeriodEnd),
                              "MMMM dd, yyyy"
                            )
                          : "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {!isSubscribed && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subscribe to Premium</CardTitle>
                    <CardDescription>
                      Get access to premium features and prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8" />
                      <div>
                        <h4 className="text-sm font-semibold">Premium Prompts</h4>
                        <p className="text-sm text-muted-foreground">
                          Access to all premium prompts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8" />
                      <div>
                        <h4 className="text-sm font-semibold">Unlimited Access</h4>
                        <p className="text-sm text-muted-foreground">
                          No limits on prompt usage
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Subscribe Now</Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="payment-method" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isSubscribed ? (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-6 w-6" />
                        <div>
                          <div className="font-medium">•••• •••• •••• 4242</div>
                          <div className="text-sm text-muted-foreground">
                            Expires {format(
                              new Date(activeSubscription.currentPeriodEnd),
                              "MM/yyyy"
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                      <div className="text-center">
                        <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">
                          No payment method
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Add a payment method to subscribe
                        </p>
                        <Button className="mt-4" size="sm">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="billing-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    View your billing history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubscribed ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">
                            {format(
                              new Date(activeSubscription.currentPeriodStart),
                              "MMMM dd, yyyy"
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {activeSubscription.price?.amount
                              ? `$${(activeSubscription.price.amount / 100).toFixed(2)}`
                              : "N/A"}
                          </div>
                        </div>
                        <Badge variant="outline">Paid</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                      <div className="text-center">
                        <h3 className="mt-2 text-sm font-medium">
                          No billing history
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Subscribe to see your billing history
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in SubscriptionPage:", error);
    return (
      <div className="container max-w-6xl py-10">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Subscription</h3>
            <p className="text-sm text-muted-foreground">
              An error occurred while loading your subscription information.
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p>Unable to load subscription details. Please try again later.</p>
                <Button variant="outline">Refresh</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
