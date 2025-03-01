import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import CategoriesManagement from "@/components/cms/categories/categories-management";
import QueryClientProvider from "@/components/cms/providers/query-client-provider";

export const metadata: Metadata = {
  title: "Categories Management | Promptaat Admin",
  description: "Manage categories and subcategories",
};

export default async function CategoriesPage() {
  // TEMPORARY FIX: In development mode, allow bypassing authentication for testing
  // This should be removed in production
  const isDev = process.env.NODE_ENV === 'development';
  
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, handle based on environment
  if (!admin) {
    console.log(`[${new Date().toISOString()}] Categories page: No admin authenticated`);
    
    if (isDev) {
      console.log(`[${new Date().toISOString()}] DEVELOPMENT MODE: Bypassing authentication redirect for testing`);
      // Continue without admin in development mode
    } else {
      // In production, redirect to login
      console.log(`[${new Date().toISOString()}] Redirecting to login page due to failed authentication`);
      redirect("/cms/auth/login");
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories Management</h1>
      </div>
      
      <QueryClientProvider>
        <CategoriesManagement />
      </QueryClientProvider>
    </div>
  );
}
