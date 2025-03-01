import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminServerSide } from "@/lib/cms/auth/admin-auth";

export async function GET(request: NextRequest) {
  try {
    console.log(`[${new Date().toISOString()}] Auth Test: Checking admin authentication...`);
    console.log("Request cookies:", request.cookies.getAll());
    
    // Check auth status
    const admin = await getCurrentAdminServerSide(request);
    console.log(`[${new Date().toISOString()}] Auth Test Result:`, admin ? `Authenticated as ${admin.email}` : "Not authenticated");
    
    // Check cookie values (masked for security)
    const cookies = request.cookies.getAll();
    const maskedCookies = cookies.map(c => ({
      name: c.name,
      value: c.name.includes('token') ? `${c.value.substring(0, 10)}...` : c.value,
      attributes: {
        path: c.path,
        domain: c.domain,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
      }
    }));
    
    return NextResponse.json({
      authenticated: !!admin,
      adminInfo: admin ? {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      } : null,
      cookies: maskedCookies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Auth Test Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown authentication error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
