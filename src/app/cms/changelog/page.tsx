import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import ChangelogManagement from "@/components/cms/changelog/changelog-management";

export const metadata: Metadata = {
  title: "Changelog Management | Promptaat Admin",
  description: "Manage changelog entries and updates",
};

export default async function ChangelogPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Changelog Management</h1>
      </div>
      
      <ChangelogManagement />
    </div>
  );
}
