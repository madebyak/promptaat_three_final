import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/token"

// Import locales from next-intl.config.ts to ensure consistency
import { locales, defaultLocale } from '../next-intl.config'

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
    // Always allow access to CMS auth routes without any redirects
    if (pathname.startsWith("/cms/auth/")) {
      // Check for admin cookies to detect potential redirect loops
      const adminTokenCookie = request.cookies.get("admin-token")?.value
      const adminRefreshTokenCookie = request.cookies.get("admin-refresh-token")?.value
      
      // Log authentication status in production for debugging
      if (process.env.NODE_ENV === 'production') {
        console.log(`[CMS AUTH MIDDLEWARE] Path: ${pathname}, HasAdminToken: ${!!adminTokenCookie}, HasNextAuthSession: ${hasNextAuthSession}`);
      }
      
      // If we detect cookies but still hitting login page, clear them to break redirect loop
      if (pathname === "/cms/auth/login" && (adminTokenCookie || adminRefreshTokenCookie)) {
        const response = NextResponse.next()
        // Clear potentially corrupted cookies
        response.cookies.delete("admin-token")
        response.cookies.delete("admin-refresh-token")
        return response
      }
      
      // Simply allow access to auth routes without any redirects or checks
      return NextResponse.next()
    }
    
    // For other CMS routes, check for admin authentication
    // Check both NextAuth session and admin-specific cookies
    const adminTokenCookie = request.cookies.get("admin-token")?.value
    if (!hasNextAuthSession && !adminTokenCookie) {
      // Redirect to CMS login if not authenticated
      // Use a clean URL without callbackUrl to prevent circular redirects
      return NextResponse.redirect(new URL("/cms/auth/login", request.url))
    }
    
    // Apply internationalization to CMS routes as well
    // This ensures that the i18n context is available in CMS components
    try {
      // We still want to apply the intl middleware to CMS routes
      // but we don't want it to redirect or change the URL
      const response = NextResponse.next()
      
      // Copy headers from what the intl middleware would have set
      // This makes the locale information available to the CMS routes
      // Using the standardized header name for Next.js 15
      response.headers.set('x-next-intl-locale', defaultLocale)
      
      return response
    } catch (err) {
      console.error('Error applying i18n to CMS route:', err)
      return NextResponse.next()
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
