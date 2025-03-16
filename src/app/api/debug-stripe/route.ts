import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { type ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

/**
 * Debug endpoint to help diagnose Stripe integration issues
 * This will test various aspects of the authentication and session handling
 */
export async function GET() {
  // 1. Get all cookies directly
  const allCookies = cookies() as unknown as ReadonlyRequestCookies;
  const cookieList = allCookies.getAll().map((c: { name: string; value: string }) => ({ 
    name: c.name,
    // Mask sensitive values
    value: c.name.includes('session') ? `${c.value.substring(0, 8)}...` : 'present'
  }));
  
  // 2. Check for authentication cookies
  const hasSessionCookie = allCookies.has('next-auth.session-token');
  const hasSecureSessionCookie = allCookies.has('__Secure-next-auth.session-token');
  
  // 3. Get headers
  const headersList = headers() as unknown as ReadonlyHeaders;
  const headerEntries: [string, string][] = [];
  
  // Convert headers to an array manually
  // Using a simple approach to avoid TypeScript errors with headers().entries()
  const headerKeys = [
    'host', 'user-agent', 'accept', 'accept-language', 'cookie',
    'referer', 'sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site'
  ];
  
  for (const key of headerKeys) {
    const value = headersList.get(key);
    if (value) {
      headerEntries.push([
        key, 
        key.includes('cookie') ? `${value.substring(0, 20)}...` : value
      ]);
    }
  }
  
  const headerItems = Object.fromEntries(headerEntries);
  
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
  
  return NextResponse.json({
    cookies: {
      list: cookieList,
      hasSessionCookie,
      hasSecureSessionCookie,
    },
    headers: headerItems,
    session: session ? {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email?.substring(0, 3) + '...',
        image: session.user.image ? 'present' : 'missing',
      },
      expires: session.expires,
    } : null,
    sessionError,
    environment: envVars,
    timestamp: new Date().toISOString(),
  });
}
