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

  try {
    if (token) {
      // Verify token
      await verifyToken(token)

      // If token is valid and user tries to access auth pages, redirect to dashboard
      if (isAuthPath) {
        const url = new URL(`/${locale}/dashboard`, request.url)
        return NextResponse.redirect(url)
      }
    } else {
      // If no token and trying to access protected pages, redirect to login
      if (isProtectedPath) {
        const url = new URL(`/${locale}/auth/login`, request.url)
        url.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
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
