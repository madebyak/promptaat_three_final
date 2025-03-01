import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import UsersManagement from "@/components/cms/users/users-management";

export const metadata: Metadata = {
  title: "Users Management | Promptaat Admin",
  description: "Manage users and subscriptions",
};

export default async function UsersPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
      </div>
      
      <UsersManagement />
    </div>
  );
}
