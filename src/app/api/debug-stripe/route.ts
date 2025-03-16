import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Debug endpoint to help diagnose Stripe integration issues
 * This will test various aspects of the authentication and session handling
 */
export async function GET(req: NextRequest) {
  // 1. Get all cookies directly
  const allCookies = cookies();
  const cookieList = allCookies.getAll().map(c => ({ 
    name: c.name,
    // Mask sensitive values
    value: c.name.includes('session') ? `${c.value.substring(0, 8)}...` : 'present'
  }));
  
  // 2. Check for authentication cookies
  const hasSessionCookie = allCookies.has('next-auth.session-token');
  const hasSecureSessionCookie = allCookies.has('__Secure-next-auth.session-token');
  
  // 3. Get headers
  const headersList = headers();
  const headerItems = Object.fromEntries(
    [...headersList.entries()].map(([key, value]) => [
      key, 
      key.includes('cookie') ? `${value.substring(0, 20)}...` : value
    ])
  );
  
  // 4. Try to get session
  let session;
  let sessionError;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    sessionError = error instanceof Error ? error.message : String(error);
  }
  
  // 5. Test environment variables
  const envVars = {
    // Only show whether they exist, not actual values
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "present" : "missing",
    NEXT_PUBLIC_NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL ? "present" : "missing",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "present" : "missing",
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "present" : "missing",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "present" : "missing",
    NODE_ENV: process.env.NODE_ENV,
  };
  
  // Return comprehensive diagnostic data
  return NextResponse.json({
    diagnostics: {
      authentication: {
        hasSession: !!session,
        hasUser: session ? !!session.user : false,
        userEmail: session?.user?.email ? `${session.user.email.substring(0, 3)}...` : null,
        sessionError,
        cookies: {
          count: cookieList.length,
          hasSessionCookie,
          hasSecureSessionCookie,
          list: cookieList
        },
      },
      request: {
        url: req.url,
        method: req.method,
        hasHeaders: !!headersList,
        headers: headerItems,
      },
      environment: envVars,
      timestamp: new Date().toISOString(),
    }
  });
}
