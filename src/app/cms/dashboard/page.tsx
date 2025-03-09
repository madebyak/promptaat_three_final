import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import DashboardClient from "@/components/cms/dashboard/dashboard-client";
import { decrypt } from "@/lib/cms/auth/admin-auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Promptaat",
  description: "Promptaat Admin Dashboard",
};

export default async function DashboardPage() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Dashboard page accessed`);
  
  try {
    // Check both authentication methods
    // 1. First try NextAuth session
    const session = await getServerSession(authOptions);
    
    // 2. Then check for custom JWT token
    let adminToken: string | undefined;
    
    // Get the admin token from cookies using a more compatible approach
    try {
      // Get all request cookies
      const cookieStore = cookies();
      
      // Manual approach to extract the admin_token cookie
      const cookieHeader = cookieStore.toString();
      console.log(`[${timestamp}] Cookie header:`, cookieHeader);
      
      // Extract admin token using regex
      const adminTokenMatch = cookieHeader.match(/admin_token=([^;]+)/);
      if (adminTokenMatch && adminTokenMatch[1]) {
        adminToken = decodeURIComponent(adminTokenMatch[1]);
        console.log(`[${timestamp}] Found admin token in cookies via regex`);
      } else {
        // Alternative approach: iterate through headers
        console.log(`[${timestamp}] No admin token found via regex, checking headers...`);
        
        // Log all available cookies for debugging
        console.log(`[${timestamp}] Available cookies (raw):`, cookieHeader);
        
        // Attempt to find the token by parsing the cookie header manually
        const cookiePairs = cookieHeader.split(';');
        for (const pair of cookiePairs) {
          const [name, value] = pair.trim().split('=');
          if (name === 'admin_token' && value) {
            adminToken = decodeURIComponent(value);
            console.log(`[${timestamp}] Found admin token via manual parsing`);
            break;
          }
        }
      }
      
      if (!adminToken) {
        console.log(`[${timestamp}] No admin token found in cookies after all attempts`);
      }
    } catch (cookieError) {
      console.error(`[${timestamp}] Error accessing cookies:`, cookieError);
    }
    
    // Get admin ID from either source
    let adminEmail: string | null = null;
    
    if (session?.user?.isAdmin && session?.user?.email) {
      // Admin authenticated via NextAuth
      console.log(`[${timestamp}] Admin authenticated via NextAuth: ${session.user.email}`);
      adminEmail = session.user.email;
    } else if (adminToken) {
      // Try to decrypt the admin token
      try {
        const payload = await decrypt(adminToken);
        if (payload && payload.email) {
          console.log(`[${timestamp}] Admin authenticated via JWT: ${payload.email}`);
          adminEmail = payload.email as string;
        }
      } catch (tokenError) {
        console.error(`[${timestamp}] Error decrypting admin token:`, tokenError);
      }
    }
    
    // Log authentication state
    console.log(`[${timestamp}] Dashboard auth check:`, {
      hasNextAuthSession: !!session?.user?.isAdmin,
      hasAdminToken: !!adminToken,
      adminEmail
    });
    
    // If not authenticated by either method, redirect to login
    if (!adminEmail) {
      console.log(`[${timestamp}] Dashboard access denied - Not authenticated as admin`);
      // Include the current URL as the callback URL
      const currentUrl = `/cms/dashboard`;
      return redirect(`/cms-login?callbackUrl=${encodeURIComponent(currentUrl)}&from=dashboard`);
    }
    
    // Get admin details from the database
    const adminUser = await prisma.adminUser.findUnique({
      where: { 
        email: adminEmail
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    // Log admin user details for debugging
    console.log(`[${timestamp}] Admin user details:`, {
      found: !!adminUser,
      isActive: adminUser?.isActive,
      email: adminUser?.email,
      role: adminUser?.role
    });
    
    if (!adminUser) {
      console.log(`[${timestamp}] Admin user not found in database despite valid session`);
      return redirect("/cms/auth/login?error=admin_not_found");
    }
    
    if (!adminUser.isActive) {
      console.log(`[${timestamp}] Admin account is inactive`);
      return redirect("/cms/auth/login?error=inactive_account");
    }
    
    console.log(`[${timestamp}] Dashboard access granted for admin: ${adminUser.email}`);
    return <DashboardClient admin={adminUser} />;
  } catch (error) {
    // Enhanced error handling with detailed logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] Dashboard page error:`, errorMessage);
    console.error(`[${timestamp}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    // Include more detailed error information and the current URL as the callback URL
    const currentUrl = `/cms/dashboard`;
    const errorType = error instanceof Error ? encodeURIComponent(error.name) : 'unknown';
    return redirect(`/cms-login?callbackUrl=${encodeURIComponent(currentUrl)}&error=dashboard_error&errorType=${errorType}`);
  }
}
