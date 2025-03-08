import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/token"

// Supported locales
const locales = ["en", "ar"]
const defaultLocale = "en"

// Create the next-intl middleware with proper configuration
const intlMiddleware = createMiddleware({
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
    pathname.startsWith("/cms") || // Skip middleware for CMS routes
    pathname.includes(".")
  ) {
    return NextResponse.next()
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
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
