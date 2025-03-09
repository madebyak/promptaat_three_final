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

// Function to handle CMS routes completely separately
export function handleCmsRoutes(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const timestamp = new Date().toISOString();
  
  // Skip all middleware processing for static files
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }
  
  console.log(`[${timestamp}] [CMS] Processing: ${pathname}`);
  
  // Special case: If accessing /cms without a trailing route, redirect to dashboard or login
  if (pathname === '/cms' || pathname === '/cms/') {
    const hasSession = request.cookies.has("next-auth.session-token") || 
                       request.cookies.has("__Secure-next-auth.session-token");
    const adminToken = request.cookies.get("admin_token")?.value;
    
    if (hasSession || adminToken) {
      return NextResponse.redirect(new URL('/cms/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/cms/auth/login', request.url));
    }
  }
  
  // Always allow access to auth pages without checks
  if (pathname.startsWith('/cms/auth')) {
    console.log(`[${timestamp}] [CMS] Auth page access: ${pathname}`);
    return NextResponse.next();
  }
  
  // Also always allow access to API routes
  if (pathname.startsWith('/cms/api')) {
    console.log(`[${timestamp}] [CMS] API access: ${pathname}`);
    return NextResponse.next();
  }
  
  // For all other CMS routes, check authentication
  const hasSession = request.cookies.has("next-auth.session-token") || 
                     request.cookies.has("__Secure-next-auth.session-token");
  const adminToken = request.cookies.get("admin_token")?.value;
  
  if (hasSession || adminToken) {
    console.log(`[${timestamp}] [CMS] Authenticated access: ${pathname}`);
    return NextResponse.next();
  }
  
  // Not authenticated - redirect to login
  console.log(`[${timestamp}] [CMS] Not authenticated, redirecting to login`);
  return NextResponse.redirect(new URL('/cms/auth/login', request.url));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware processing for static files and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Handle CMS routes completely separately
  if (pathname.startsWith('/cms')) {
    return handleCmsRoutes(request);
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
  // Define precise matching patterns to avoid confusion
  matcher: [
    // Match all paths except excluded ones like API and static files
    '/((?!_next|api|.*\\..*).*)',
    
    // Explicitly match all CMS routes
    '/cms/:path*'
  ]
}
