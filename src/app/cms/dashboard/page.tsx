import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/cms/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Promptaat",
  description: "Promptaat Admin Dashboard",
};

export default async function DashboardPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard admin={admin} />
    </div>
  );
}
