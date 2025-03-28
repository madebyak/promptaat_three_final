"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, FileText, FolderTree, Wrench, Settings, PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { MetricSkeleton } from "./metric-skeleton";
import PopularPrompts from "./popular-prompts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardProps {
  admin: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

export default function Dashboard({ admin }: DashboardProps) {
  const { metrics, loading, error, refetch } = useDashboardMetrics();
  const [refreshing, setRefreshing] = useState(false);
  const adminName = admin.firstName || admin.email.split('@')[0];

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500); // Minimum visual feedback time
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section with refresh button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {adminName}</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your content and system statistics</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh} 
                disabled={loading || refreshing}
                className="h-10 w-10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh dashboard</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh dashboard data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Error message if API call fails */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error loading dashboard data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Stats cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Prompts Card */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Total Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{metrics?.promptCount || 0}</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cms/prompts" className="text-xs">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Users Card */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{metrics?.userCount || 0}</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cms/users" className="text-xs">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Categories Card */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-amber-500" />
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{metrics?.totalCategories || 0}</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cms/categories" className="text-xs">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Prompt Usage Card */}
        {loading ? (
          <MetricSkeleton />
        ) : (
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart className="h-4 w-4 text-purple-500" />
                Prompt Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{metrics?.promptUsage || 0}</div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/cms/analytics" className="text-xs">Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Popular Prompts Card */}
        <div className="lg:col-span-2">
          <PopularPrompts 
            prompts={metrics?.recentPrompts} 
            loading={loading} 
          />
        </div>
        
        {/* Quick Actions Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Link href="/cms/prompts/create" className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200">
                <PlusCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">Create New Prompt</span>
              </Link>
              <Link href="/cms/prompts" className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <FileText className="h-4 w-4 text-gray-600" />
                <span>Manage Prompts</span>
              </Link>
              <Link href="/cms/categories" className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <FolderTree className="h-4 w-4 text-gray-600" />
                <span>Manage Categories</span>
              </Link>
              <Link href="/cms/users" className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <Users className="h-4 w-4 text-gray-600" />
                <span>Manage Users</span>
              </Link>
              <Link href="/cms/settings" className="flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <Settings className="h-4 w-4 text-gray-600" />
                <span>System Settings</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
