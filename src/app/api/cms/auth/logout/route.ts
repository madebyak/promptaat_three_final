import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/cms/auth/admin-auth";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();
    
    if (admin) {
      // Create audit log for logout
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "logout",
          entityType: "admin",
          entityId: admin.id,
          details: { ip: "system" },
        },
      });
    }
    
    // Create response
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Clear auth cookies
    return clearAuthCookies(response);
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
