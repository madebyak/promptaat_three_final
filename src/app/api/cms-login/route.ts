import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import crypto from 'crypto';

/**
 * API route for handling CMS login requests
 * This bypasses the NextAuth flow and directly authenticates admin users
 */
// Disable response caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [CMS API] Processing login request`);
    
    // Parse the request body with error handling
    let body;
    try {
      body = await request.json();
      console.log(`[${timestamp}] [CMS API] Request body received:`, { 
        hasEmail: !!body.email, 
        hasPassword: !!body.password 
      });
    } catch (parseError) {
      console.error(`[${timestamp}] [CMS API] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    const { email, password } = body;
    
    if (!email || !password) {
      console.error(`[${timestamp}] [CMS API] Missing email or password`);
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log(`[${timestamp}] [CMS API] Attempting login for: ${email}`);
    
    // Find the admin user from the adminUser table
    const adminUser = await prisma.adminUser.findUnique({
      where: { email, isActive: true },
    });
    
    if (!adminUser) {
      console.error(`[${timestamp}] [CMS API] Admin user not found or not active: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password using direct hash comparison for now
    // This is a temporary fix until we standardize the hashing approach
    const salt = 'promptaat-static-salt';
    let generatedHash;
    try {
      generatedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
      console.log(`[${timestamp}] [CMS API] Generated hash for comparison`);
    } catch (hashError) {
      console.error(`[${timestamp}] [CMS API] Error generating hash:`, hashError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
    
    console.log(`[${timestamp}] [CMS API] Password verification:`, {
      storedHashLength: adminUser.passwordHash.length,
      generatedHashLength: generatedHash.length,
      storedHashPrefix: adminUser.passwordHash.substring(0, 5),
      generatedHashPrefix: generatedHash.substring(0, 5),
      match: generatedHash === adminUser.passwordHash
    });
    
    const isPasswordValid = generatedHash === adminUser.passwordHash;
    
    if (!isPasswordValid) {
      console.error(`[${timestamp}] [CMS API] Invalid password for: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Create a session token (this would normally be handled by NextAuth)
    // For simplicity, we'll just return success and let the client redirect
    console.log(`[${timestamp}] [CMS API] Login successful for: ${email}`);
    
    // In a real implementation, you would set cookies and handle session here
    // Update last login time
    try {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateError) {
      console.error(`[${timestamp}] [CMS API] Failed to update last login time:`, updateError);
      // Non-critical error, continue with login
    }

    // Set headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    
    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.firstName && adminUser.lastName ? 
          `${adminUser.firstName} ${adminUser.lastName}` : 
          adminUser.email.split('@')[0],
        role: adminUser.role,
      },
      // Return just the path, client will handle prepending the origin
      url: '/cms/dashboard',
      // Include a timestamp to prevent caching issues
      timestamp: new Date().getTime(),
    }, {
      headers
    });
    
  } catch (error) {
    console.error('[CMS API] Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
