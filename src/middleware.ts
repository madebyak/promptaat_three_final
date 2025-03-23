import createIntlMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/token"
import { isCmsPath } from "../next-intl.config"
import { profileCompletionMiddleware } from "./middleware/profile-completion"

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
const authPaths = [
  "/auth/login", 
  "/auth/register", 
  "/auth/verify", 
  "/auth/forgot-password", 
  "/auth/reset-password",
  "/en/auth/", 
  "/ar/auth/"
]

// Paths that are exempt from profile completion check
const profileCompletionExemptPaths = [
  "/auth/profile-completion",
  "/api/auth/complete-profile",
]

// Enhanced function to handle CMS routes with detailed logging
async function handleCmsRoutes(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Use a fixed prefix for logging to avoid hydration issues
  console.log(`[Middleware] Processing CMS route: ${pathname}`);
  
  // Always allow access to the standalone CMS login page and its assets
  if (pathname === '/cms-login' || pathname.startsWith('/cms-login/')) {
    console.log(`[Middleware] Allowing access to standalone CMS login page: ${pathname}`);
    return NextResponse.next();
  }
  
  // Always allow access to CMS auth routes without any checks
  if (pathname.startsWith('/cms/auth')) {
    console.log(`[Middleware] Allowing access to CMS auth route: ${pathname}`);
    return NextResponse.next();
  }
  
  // Always allow access to CMS static assets
  if (pathname.includes('/static/') || pathname.includes('/assets/')) {
    console.log(`[Middleware] Allowing access to static asset: ${pathname}`);
    return NextResponse.next();
  }
  
  // Allow access to CMS API routes
  if (pathname.startsWith('/api/cms') || pathname.startsWith('/cms/api')) {
    console.log(`[Middleware] Allowing access to CMS API route: ${pathname}`);
    return NextResponse.next();
  }
  
  // For other CMS routes, check for authentication
  const hasNextAuthSession = request.cookies.has('next-auth.session-token') || 
                           request.cookies.has('__Secure-next-auth.session-token');
  const hasAdminToken = !!request.cookies.get('admin_token')?.value;
  
  // Log all cookies for debugging in development
  if (process.env.NODE_ENV === 'development') {
    const cookieNames = Array.from(request.cookies.getAll()).map(c => c.name);
    console.log(`[Middleware] Available cookies:`, cookieNames);
  }
  
  console.log(`[Middleware] CMS auth check: hasNextAuthSession=${hasNextAuthSession}, hasAdminToken=${hasAdminToken}`);
  
  // If user is authenticated, allow access
  if (hasNextAuthSession || hasAdminToken) {
    console.log(`[Middleware] User is authenticated, allowing access to: ${pathname}`);
    return NextResponse.next();
  }
  
  // Not authenticated, redirect to standalone login page
  console.log(`[Middleware] User is NOT authenticated, redirecting to CMS login page from: ${pathname}`);
  
  // Include the original URL as a callback parameter
  // Use the current request URL to ensure we maintain the correct port
  const origin = request.nextUrl.origin;
  const loginUrl = new URL('/cms-login', origin);
  
  // For callback, use the full URL including origin to avoid port mismatches
  const fullCallbackPath = `${origin}${pathname}`;
  loginUrl.searchParams.set('callbackUrl', fullCallbackPath);
  
  console.log(`[Middleware] Redirecting to CMS login: ${loginUrl.toString()} with callback: ${fullCallbackPath}`);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Add detailed logging in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Processing request for: ${pathname}`);
  }
  
  // Skip middleware for static files, API routes, etc.
  // IMPORTANT: We must allow all API routes to pass through without middleware processing
  if (pathname.startsWith('/_next') || 
      pathname.includes('.') ||
      pathname.startsWith('/api/') ||
      pathname.includes('/static/') ||
      pathname.includes('/assets/')) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Skipping middleware for excluded path: ${pathname}`);
    }
    return NextResponse.next();
  }
  
  // Handle CMS routes - completely separate path
  if (isCmsPath(pathname)) {
    return await handleCmsRoutes(request);
  }

  // Handle root path - redirect to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // Handle internationalization first
  const response = await intlMiddleware(request)

  // Get locale from URL for proper path handling
  const locale = pathname.split("/")[1] || defaultLocale
  
  // Get authentication tokens and session information
  const token = request.cookies.get("token")?.value
  const hasNextAuthSession = request.cookies.has("next-auth.session-token") || 
                          request.cookies.has("__Secure-next-auth.session-token")
  
  // Log authentication state in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Auth check for ${pathname}: token=${!!token}, hasNextAuthSession=${hasNextAuthSession}`);
  }
  
  // Improved path matching for protected and auth paths
  const isProtectedPath = protectedPaths.some((p) => pathname.includes(p))
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p))

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
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Middleware] Authenticated user redirected from auth page to: ${url}`);
        }
        return NextResponse.redirect(url)
      }
      
      // Check for profile completion status if we have NextAuth session
      // Only perform this check for authenticated users visiting non-exempt routes
      const needsProfileCompletionCookie = request.cookies.get("needs_profile_completion")
      const needsProfileCompletion = needsProfileCompletionCookie && needsProfileCompletionCookie.value === "true"
      const isProfileCompletionExempt = profileCompletionExemptPaths.some(path => pathname.includes(path))
      
      if (needsProfileCompletion && !isProfileCompletionExempt) {
        const profileCompletionUrl = new URL(`/${locale}/auth/profile-completion`, request.url)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Middleware] User needs profile completion, redirecting to: ${profileCompletionUrl}`);
        }
        return NextResponse.redirect(profileCompletionUrl)
      }
    } else {
      // If not authenticated and trying to access protected pages, redirect to login
      if (isProtectedPath) {
        const url = new URL(`/${locale}/auth/login`, request.url)
        url.searchParams.set("callbackUrl", pathname)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Middleware] Unauthenticated user redirected to login from: ${pathname}`);
        }
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    // Log the error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Middleware] Token verification error:`, error);
    }
    
    // If token verification fails, clear the token and redirect to login
    if (isProtectedPath) {
      const response = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
      response.cookies.delete("token")
      return response
    }
  }

  // Integrate profile completion middleware
  const profileCompletionResponse = await profileCompletionMiddleware(request);
  if (profileCompletionResponse) {
    return profileCompletionResponse;
  }

  return response
}



export const config = {
  matcher: [
    // Match all paths except API routes and static assets
    '/((?!api|_next/static|_next/image|favicon.ico|static|assets).*)',
  ]
}
