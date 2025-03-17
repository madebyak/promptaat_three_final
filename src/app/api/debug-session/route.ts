import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Security check - only allow in development or with debug token
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.DEBUG_SESSION_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    // Get cookie information from request headers directly
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieMap: Record<string, string> = {};
    
    // Parse cookies from header
    const cookiePairs = cookieHeader.split(';').map(pair => pair.trim());
    cookiePairs.forEach(pair => {
      const [name, value] = pair.split('=');
      if (name) cookieMap[name] = value || '';
    });
    
    // Check for session-related cookies specifically
    const authCookies = {
      hasSessionToken: 'next-auth.session-token' in cookieMap,
      hasSecureSessionToken: '__Secure-next-auth.session-token' in cookieMap,
      hasCallbackUrl: 'next-auth.callback-url' in cookieMap,
      hasSecureCallbackUrl: '__Secure-next-auth.callback-url' in cookieMap,
      hasCsrfToken: 'next-auth.csrf-token' in cookieMap,
      hasHostCsrfToken: '__Host-next-auth.csrf-token' in cookieMap,
    };

    // Try to get the session
    let session = null;
    let sessionError = null;
    
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      sessionError = error instanceof Error ? error.message : "Unknown session error";
    }

    // Return debugging information
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      requestInfo: {
        url: req.url,
        headers: {
          host: req.headers.get("host"),
          origin: req.headers.get("origin"),
          referer: req.headers.get("referer"),
          userAgent: req.headers.get("user-agent"),
          cookie: `${cookieHeader.substring(0, 20)}...` // Show only part of cookie header
        }
      },
      cookieInfo: {
        cookieCount: Object.keys(cookieMap).length,
        cookieNames: Object.keys(cookieMap),
        authCookies,
      },
      sessionCheck: {
        hasSession: !!session,
        hasSessionError: !!sessionError,
        sessionError,
        sessionUserId: session?.user?.id ? `${session.user.id.substring(0, 5)}...` : null,
        sessionUserEmail: session?.user?.email ? `${session.user.email.substring(0, 3)}...` : null,
      },
      authOptions: {
        hasJwtSecret: !!process.env.NEXTAUTH_SECRET,
        hasAuthUrl: !!process.env.NEXTAUTH_URL,
        sessionStrategy: authOptions.session?.strategy || "unknown",
        cookieDomain: process.env.COOKIE_DOMAIN || "not set",
      }
    });
  } catch (error) {
    console.error("[DEBUG] Session debug error:", error);
    return NextResponse.json(
      { 
        error: "Error debugging session", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
