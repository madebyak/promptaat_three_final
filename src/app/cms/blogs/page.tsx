import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import BlogsManagement from "@/components/cms/blogs/blogs-management";

export const metadata: Metadata = {
  title: "Blogs Management | Promptaat Admin",
  description: "Manage blog posts and content",
};

export default async function BlogsPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Blogs Management</h1>
      </div>
      
      <BlogsManagement />
    </div>
  );
}
