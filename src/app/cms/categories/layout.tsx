import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/cms/layout/admin-layout";

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
      // Create a mock admin for development purposes
      const mockAdmin = {
        id: 'dev-admin-id',
        email: 'dev@example.com',
        firstName: 'Development',
        lastName: 'Admin',
        role: 'admin'
      };
      
      return (
        <AdminLayout admin={mockAdmin}>
          {children}
        </AdminLayout>
      );
    } else {
      // In production, redirect to login
      console.log(`[${new Date().toISOString()}] Redirecting to login page due to failed authentication`);
      redirect("/cms/auth/login");
    }
  }
  
  return (
    <AdminLayout admin={admin}>
      {children}
    </AdminLayout>
  );
}
