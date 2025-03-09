import { Metadata } from "next";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/cms/dashboard/dashboard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const metadata: Metadata = {
  title: "Admin Dashboard | Promptaat",
  description: "Promptaat Admin Dashboard",
};

export default async function DashboardPage() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Dashboard page accessed`);
  
  try {
    // Check both authentication systems for comprehensive debugging
    const [admin, session] = await Promise.allSettled([
      getCurrentAdmin(),
      getServerSession(authOptions)
    ]);
    
    // Log authentication state from both systems
    console.log(`[${timestamp}] Dashboard auth check:`, {
      adminResult: admin.status,
      hasAdmin: admin.status === 'fulfilled' && !!admin.value,
      sessionResult: session.status,
      hasSession: session.status === 'fulfilled' && !!session.value
    });
    
    // Get the admin value if available
    const adminValue = admin.status === 'fulfilled' ? admin.value : null;
    
    // If not authenticated via getCurrentAdmin, redirect to login
    if (!adminValue) {
      console.log(`[${timestamp}] Dashboard access denied - Not authenticated`);
      return redirect("/cms/auth/login?from=dashboard");
    }
    
    console.log(`[${timestamp}] Dashboard access granted for admin: ${adminValue.email}`);
    return <Dashboard admin={adminValue} />;
  } catch (error) {
    // Enhanced error handling with detailed logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Dashboard page error:`, errorMessage);
    console.error(`[${timestamp}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    // Redirect to login with error parameter for tracking
    return redirect("/cms/auth/login?error=dashboard_error");
  }
}
