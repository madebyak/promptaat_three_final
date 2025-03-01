import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/cms/layout/admin-layout";

export const metadata: Metadata = {
  title: "Tools Management | Promptaat Admin",
  description: "Manage AI tools for prompts",
};

export default async function ToolsLayout({
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
    console.log(`[${new Date().toISOString()}] Tools layout: Authentication check failed`);
    
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
          <ToolsContent>{children}</ToolsContent>
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
      <ToolsContent>{children}</ToolsContent>
    </AdminLayout>
  );
}

// Separate component for the tools content
function ToolsContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tools</h2>
          <p className="text-muted-foreground">
            Manage AI tools that can be associated with prompts
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading tools...</p>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
} 