import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  // In production, require a debug token for security
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    const debugToken = process.env.DEBUG_AUTH_TOKEN;
    
    if (!debugToken) {
      console.warn("[DEBUG] No DEBUG_AUTH_TOKEN set in environment variables");
      return NextResponse.json(
        { error: "Debug token not configured on server" },
        { status: 500, headers: corsHeaders }
      );
    }
    
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== debugToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Get all cookies for debugging
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = cookieHeader.split(";").map(cookie => cookie.trim());
    
    // Check for specific session cookies
    const sessionCookies = cookies.filter(cookie => 
      cookie.startsWith("next-auth.session-token=") || 
      cookie.startsWith("__Secure-next-auth.session-token=")
    );
    
    // Get request headers for debugging
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Filter out sensitive headers
      if (!["cookie", "authorization"].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    
    // Get environment variables (non-sensitive ones)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      hasStripeKeys: !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    };
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        } : null,
      },
      cookies: {
        count: cookies.length,
        sessionCookies: sessionCookies.map(cookie => {
          const [name] = cookie.split("=");
          return {
            name,
            exists: true,
            // Don't include the actual value for security reasons
            length: cookie.length,
          };
        }),
      },
      request: {
        url: req.url,
        method: req.method,
        headers,
      },
      environment: envVars,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("[DEBUG] Error in debug endpoint:", error);
    
    return NextResponse.json({
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500, headers: corsHeaders });
  }
}
