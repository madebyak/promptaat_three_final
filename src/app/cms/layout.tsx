import { Metadata } from "next"
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/cms/layout/admin-layout";

export const metadata: Metadata = {
  title: "Promptaat CMS",
  description: "Content Management System for Promptaat",
}

// Force dynamic rendering to ensure the page is always fresh
export const dynamic = 'force-dynamic';

/**
 * Main CMS Layout Component
 * 
 * This layout provides the structure for all CMS pages.
 * It wraps all CMS pages with the AdminLayout component
 * which includes the sidebar and navbar.
 */
export default async function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current admin user
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms-login?callbackUrl=/cms/dashboard");
  }
  
  // Wrap children with AdminLayout
  return (
    <AdminLayout admin={admin}>
      {children}
    </AdminLayout>
  );
}
