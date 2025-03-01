import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import PromptsManagement from "@/components/cms/prompts/prompts-management";

export const metadata: Metadata = {
  title: "Prompts Management | Promptaat Admin",
  description: "Manage prompts and templates",
};

export default async function PromptsPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Prompts Management</h1>
      </div>
      
      <PromptsManagement />
    </div>
  );
}
