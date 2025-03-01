import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import SettingsManagement from "@/components/cms/settings/settings-management";

export const metadata: Metadata = {
  title: "Settings | Promptaat Admin",
  description: "Admin settings and configuration",
};

export default async function SettingsPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <SettingsManagement admin={admin} />
    </div>
  );
}
