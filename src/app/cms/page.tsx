import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

export default async function AdminIndexPage() {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If authenticated, redirect to dashboard
  if (admin) {
    redirect("/cms/dashboard");
  }
  
  // If not authenticated, redirect to login
  redirect("/cms/auth/login");
}
