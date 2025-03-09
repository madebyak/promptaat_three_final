import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/token"

// Supported locales
const locales = ["en", "ar"]
const defaultLocale = "en"

// Create the next-intl middleware with proper configuration
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  // This should be "always" to ensure locale is always in the URL
  localePrefix: "always",
})

// Paths that require authentication
const protectedPaths = ["/dashboard", "/profile", "/my-prompts", "/settings"]

// Paths that are only accessible to non-authenticated users
// Update to include localized paths for better matching
const authPaths = [
  "/auth/login", 
  "/auth/register", 
  "/auth/verify", 
  "/auth/forgot-password", 
  "/auth/reset-password",
  "/en/auth/", 
  "/ar/auth/"
]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const pathname = request.nextUrl.pathname
  
  // Check for NextAuth.js session cookie
  const hasNextAuthSession = request.cookies.has("next-auth.session-token") || 
                            request.cookies.has("__Secure-next-auth.session-token")

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }
  
  // Special handling for CMS routes
  if (pathname.startsWith("/cms")) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [Middleware] Processing CMS route: ${pathname}`);
    
    try {
      // Always allow access to CMS auth routes without any redirects
      if (pathname.startsWith("/cms/auth/")) {
        // Skip authentication checks for auth-related routes
        // This prevents circular redirects by completely bypassing auth checks for these routes
        console.log(`[${timestamp}] [Middleware] Allowing access to CMS auth path: ${pathname}`);
        return NextResponse.next();
      }
      
      // Also always allow access to API routes
      if (pathname.startsWith("/cms/api/")) {
        console.log(`[${timestamp}] [Middleware] Allowing access to CMS API path: ${pathname}`);
        return NextResponse.next();
      }
      
      // For other CMS routes, check for authentication
      // We check for either NextAuth session or custom admin token for maximum compatibility
      const adminToken = request.cookies.get("admin_token")?.value;
      const hasAdminToken = !!adminToken;
      
      console.log(`[${timestamp}] [Middleware] Auth check for ${pathname}:`, {
        hasNextAuthSession,
        hasAdminToken
      });
      
      // If either authentication method is present, allow access
      if (hasNextAuthSession || hasAdminToken) {
        console.log(`[${timestamp}] [Middleware] User authenticated for CMS path: ${pathname}`);
        return NextResponse.next();
      }
      
      // No valid authentication found, redirect to login
      console.log(`[${timestamp}] [Middleware] Redirecting to CMS login from ${pathname} - No valid auth`);
      return NextResponse.redirect(new URL("/cms/auth/login/", request.url));
    } catch (error) {
      // Detailed error logging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[${timestamp}] [Middleware] Error handling CMS route ${pathname}:`, errorMessage);
      
      // In case of an error, redirect to login for safety
      // But add a debug parameter to help identify the source of redirects
      const loginUrl = new URL("/cms/auth/login/", request.url);
      loginUrl.searchParams.set("error", "middleware_error");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle root path - redirect to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // Handle internationalization first
  const response = await intlMiddleware(request)

  // Get locale from URL for proper path handling
  const locale = pathname.split("/")[1] || defaultLocale
  
  // Improved path matching for protected and auth paths
  const isProtectedPath = protectedPaths.some((p) => pathname.includes(p))
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))

  // Log authentication status in production for debugging
  if (process.env.NODE_ENV === 'production' && isProtectedPath) {
    console.log(`[AUTH MIDDLEWARE] Path: ${pathname}, HasToken: ${!!token}, HasNextAuthSession: ${hasNextAuthSession}`);
  }

  try {
    // Check for either token-based auth OR NextAuth session
    if (token || hasNextAuthSession) {
      // If using token-based auth, verify the token
      if (token) {
        await verifyToken(token)
      }

      // If authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthPath) {
        const url = new URL(`/${locale}/dashboard`, request.url)
        return NextResponse.redirect(url)
      }
    } else {
      // If not authenticated and trying to access protected pages, redirect to login
      if (isProtectedPath) {
        const url = new URL(`/${locale}/auth/login`, request.url)
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    // Log the error in production
    console.error(`[AUTH ERROR] Token verification failed:`, err);
    
    // If token verification fails, clear the token and redirect to login
    if (isProtectedPath) {
      const response = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
      response.cookies.delete("token")
      return response
    }
  }

  return response
}



export const config = {
  matcher: [
    "/((?!_next|api|.*\\..*).*)", 
    // Explicitly include CMS paths
    "/cms/:path*"
  ]
}
