import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

/**
 * Comprehensive list of paths that should bypass the profile completion check.
 * This includes authentication paths, API routes, static assets, and critical user flows
 * like subscription pages that should never be interrupted.
 */
const BYPASS_PATHS = [
  // Authentication and API routes
  '/auth',
  '/api',
  
  // Static assets and resources
  '/_next',
  '/static',
  '/images',
  '/favicon',
  
  // The profile completion page itself (to avoid redirect loops)
  '/profile/complete',
  
  // Critical user flows that should not be interrupted
  '/logout',
  
  // Legal pages
  '/en/terms',
  '/ar/terms',
  '/en/privacy',
  '/ar/privacy',
  
  // Subscription pages - critical for business functionality
  '/en/subscription',
  '/ar/subscription',
  '/subscription',
  
  // Checkout pages - critical for payment flow
  '/checkout',
  '/en/checkout',
  '/ar/checkout',
  '/checkout/success',
  '/en/checkout/success',
  '/ar/checkout/success',
  '/checkout/cancel',
  '/en/checkout/cancel',
  '/ar/checkout/cancel',
  
  // Add any other critical paths here
];

/**
 * Checks if the current path should bypass the profile completion check
 * @param pathname The current URL pathname
 * @returns boolean indicating if the path should bypass the check
 */
const shouldBypass = (pathname: string) => {
  return BYPASS_PATHS.some(path => pathname.startsWith(path));
};

/**
 * Middleware to handle profile completion flow for Google-authenticated users.
 * This middleware checks if a user has their country set to "Unknown" and redirects
 * them to the profile completion page if needed.
 * 
 * @param req The incoming request
 * @returns NextResponse with appropriate action (redirect or next)
 */
export async function profileCompletionMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Add debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ProfileCompletionMiddleware] Processing: ${pathname}`);
  }
  
  // Skip the middleware for paths that should bypass
  if (shouldBypass(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ProfileCompletionMiddleware] Bypassing: ${pathname}`);
    }
    return NextResponse.next();
  }

  try {
    // Get the session token
    const token = await getToken({ req });
    
    // If no token/session, continue
    if (!token || !token.email) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProfileCompletionMiddleware] No session token, continuing`);
      }
      return NextResponse.next();
    }

    // Check if the user exists and has an unknown country
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: { id: true, country: true, googleId: true },
    });

    // If user doesn't exist or already has a valid country (not "Unknown"), continue
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProfileCompletionMiddleware] User not found, continuing`);
      }
      return NextResponse.next();
    }
    
    if (user.country !== 'Unknown' && user.country !== '') {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProfileCompletionMiddleware] User has country set (${user.country}), continuing`);
      }
      return NextResponse.next();
    }

    // If user has "Unknown" country and is from Google (has googleId), redirect to profile completion
    if ((user.country === 'Unknown' || user.country === '') && user.googleId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ProfileCompletionMiddleware] Redirecting user ${user.id} to profile completion`);
      }
      
      const url = new URL('/profile/complete', req.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error in profile completion middleware:', error);
    // In case of error, don't block the user
    return NextResponse.next();
  }
}
