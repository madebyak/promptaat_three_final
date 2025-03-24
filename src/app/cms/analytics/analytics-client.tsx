"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, Map, TrendingUp, PieChart } from "lucide-react";
import UserGrowthChart from "@/components/cms/analytics/user-growth-chart";
import UserRetentionCohort from "@/components/cms/analytics/user-retention-cohort";
import GeoDistribution from "@/components/cms/analytics/geo-distribution";
import ActivationMetrics from "@/components/cms/analytics/activation-metrics";
import UserSegments from "@/components/cms/analytics/user-segments";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

// We're not currently using the admin prop, but keeping the interface for future use
interface AnalyticsClientProps {
  admin?: AdminUser;
}

export default function AnalyticsClient({ }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState("user-analytics");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In the future, add refresh logic for analytics data
    setTimeout(() => setIsRefreshing(false), 800); // Visual feedback
  };

  return (
    <div className="space-y-6">
      {/* Header with title and refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights and metrics for Promptaat</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="h-10 w-10"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh analytics data</span>
        </Button>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="user-analytics" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:max-w-2xl">
          <TabsTrigger value="user-analytics">User Analytics</TabsTrigger>
          <TabsTrigger value="content-analytics">Content Analytics</TabsTrigger>
          <TabsTrigger value="subscription-analytics">Subscription Analytics</TabsTrigger>
        </TabsList>
        
        {/* User Analytics Tab */}
        <TabsContent value="user-analytics" className="space-y-6 mt-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">
                  Month over month growth
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geo Reach</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  Countries represented
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activation Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">
                  Of users used at least 1 prompt
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Power Users</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15%</div>
                <p className="text-xs text-muted-foreground">
                  Users with high engagement
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>
                  New user signups over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UserGrowthChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographical Distribution</CardTitle>
                <CardDescription>
                  User distribution by country
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <GeoDistribution />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>
                  Breakdown by activity level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <UserSegments />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>User Retention Cohort</CardTitle>
                <CardDescription>
                  Percentage of users returning after signup by cohort
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto h-auto pb-8">
                <UserRetentionCohort />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activation</CardTitle>
                <CardDescription>
                  Percentage of users who use at least one prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ActivationMetrics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Analytics Tab (Placeholder for future implementation) */}
        <TabsContent value="content-analytics">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>
                Coming soon in the next phase
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Content analytics will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Analytics Tab (Placeholder for future implementation) */}
        <TabsContent value="subscription-analytics">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Subscription Analytics</CardTitle>
              <CardDescription>
                Coming soon in the next phase
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Subscription analytics will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
