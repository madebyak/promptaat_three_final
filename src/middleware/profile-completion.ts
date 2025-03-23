import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

// Paths that should bypass the profile completion check
const BYPASS_PATHS = [
  '/auth',
  '/api',
  '/_next',
  '/static',
  '/images',
  '/favicon',
  '/profile/complete',
  '/logout',
  '/en/terms',
  '/ar/terms',
  '/en/privacy',
  '/ar/privacy',
];

// Check if the current path should bypass the profile completion check
const shouldBypass = (pathname: string) => {
  return BYPASS_PATHS.some(path => pathname.startsWith(path));
};

export async function profileCompletionMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip the middleware for paths that should bypass
  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get the session token
    const token = await getToken({ req });
    
    // If no token/session, continue
    if (!token || !token.email) {
      return NextResponse.next();
    }

    // Check if the user exists and has an unknown country
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
      select: { country: true, googleId: true },
    });

    // If user doesn't exist or already has a valid country (not "Unknown"), continue
    if (!user || (user.country !== 'Unknown' && user.country !== '')) {
      return NextResponse.next();
    }

    // If user has "Unknown" country and is from Google (has googleId), redirect to profile completion
    if ((user.country === 'Unknown' || user.country === '') && user.googleId) {
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
