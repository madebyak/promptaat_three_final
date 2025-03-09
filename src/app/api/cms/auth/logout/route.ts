import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/cms/auth/admin-auth";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function POST() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Logout request received`);
  
  try {
    // Get current admin from both systems
    const admin = await getCurrentAdmin();
    const session = await getServerSession(authOptions);
    
    // Log the session state for debugging
    console.log(`[${timestamp}] Logout - NextAuth session:`, session ? "exists" : "none");
    console.log(`[${timestamp}] Logout - Custom admin token:`, admin ? "exists" : "none");
    
    if (admin) {
      // Create audit log for logout
      try {
        await prisma.auditLog.create({
          data: {
            adminId: admin.id,
            action: "logout",
            entityType: "admin",
            entityId: admin.id,
            details: { ip: "system" },
          },
        });
        console.log(`[${timestamp}] Logout audit log created for admin: ${admin.id}`);
      } catch (auditError) {
        // Non-critical error, log but continue
        console.error(`[${timestamp}] Audit log creation failed:`, auditError);
      }
    }
    
    // Create response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Clear NextAuth session cookies
    const clearNextAuthCookies = (resp: NextResponse) => {
      // Clear the next-auth.session-token cookie
      resp.cookies.set({
        name: "next-auth.session-token",
        value: "",
        maxAge: 0,
        path: "/",
      });
      
      // Also clear the secure version used in production
      resp.cookies.set({
        name: "__Secure-next-auth.session-token",
        value: "",
        maxAge: 0,
        path: "/",
      });
      
      // Clear the CSRF token too
      resp.cookies.set({
        name: "next-auth.csrf-token",
        value: "",
        maxAge: 0,
        path: "/",
      });
      
      resp.cookies.set({
        name: "__Secure-next-auth.csrf-token",
        value: "",
        maxAge: 0,
        path: "/",
      });
      
      console.log(`[${timestamp}] NextAuth cookies cleared`);
      return resp;
    };
    
    // Clear both custom auth cookies and NextAuth cookies
    let finalResponse = clearAuthCookies(response);
    finalResponse = clearNextAuthCookies(finalResponse);
    
    console.log(`[${timestamp}] All auth cookies cleared successfully`);
    return finalResponse;
  } catch (error) {
    console.error(`[${timestamp}] Logout error:`, error);
    
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
