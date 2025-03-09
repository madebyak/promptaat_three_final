import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // TEMPORARY FIX: In development mode, allow bypassing authentication for testing
  // This should be removed in production
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!admin) {
    console.log(`[${new Date().toISOString()}] Categories layout: Authentication check failed`);
    
    if (isDev) {
      console.log(`[${new Date().toISOString()}] DEVELOPMENT MODE: Bypassing authentication redirect for testing`);
      // Return children directly without AdminLayout to prevent duplicate sidebars
      return children;
    } else {
      // In production, redirect to login
      console.log(`[${new Date().toISOString()}] Redirecting to login page due to failed authentication`);
      redirect("/cms/auth/login");
    }
  }
  
  // Return children directly without AdminLayout to prevent duplicate sidebars
  // The main CMS layout already provides the sidebar
  return children;
}
