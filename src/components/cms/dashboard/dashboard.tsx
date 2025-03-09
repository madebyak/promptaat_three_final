"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, FileText, FolderTree, Wrench, Settings, Activity, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
  // We still need the admin prop for TypeScript validation, but we'll use it in a personalized section
  const adminName = admin.firstName || admin.email.split('@')[0];
  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {adminName}</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s an overview of your content and system statistics</p>
      </div>
      
      {/* Stats cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Total Prompts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/cms/prompts" className="text-xs">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/cms/users" className="text-xs">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-amber-500" />
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/cms/categories" className="text-xs">View All</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart className="h-4 w-4 text-purple-500" />
              Prompt Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">0</div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/cms/analytics" className="text-xs">Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Card */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </div>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-muted-foreground text-center py-8">No recent activity to display</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
