import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  // Return children directly without the AdminLayout wrapper
  // This prevents duplicate sidebars since the main CMS layout already has a sidebar
  return children;
}
