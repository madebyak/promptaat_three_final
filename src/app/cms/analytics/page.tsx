import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "@/app/cms/analytics/analytics-client";

export const metadata: Metadata = {
  title: "Analytics | Promptaat CMS",
  description: "User analytics and insights for Promptaat",
};

// Force dynamic rendering to ensure the page is always fresh
export const dynamic = "force-dynamic";

/**
 * Analytics Page Component
 * 
 * Displays user analytics and insights for the Promptaat platform.
 * Requires admin authentication.
 */
export default async function AnalyticsPage() {
  // Get current admin user
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms-login?callbackUrl=/cms/analytics");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AnalyticsClient admin={admin} />
    </div>
  );
}
