import { NextRequest, NextResponse } from "next/server";
import { 
  encrypt, 
  generateRefreshToken, 
  loginSchema, 
  setAuthCookies, 
  validateAdminCredentials 
} from "@/lib/cms/auth/admin-auth";
import { ZodError } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// Define a type for log data to avoid using 'any'
type LogData = Record<string, unknown>;

// Helper function for consistent logging
function logWithTimestamp(message: string, data?: LogData) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [CMS-LOGIN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export async function POST(request: NextRequest) {
  logWithTimestamp('Login attempt started');
  
  try {
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    logWithTimestamp(`Environment: ${isDev ? 'development' : 'production'}`);
    
    // Special handling for development mode
    if (isDev) {
      logWithTimestamp('Development mode detected, checking if auto-login should be used');
      
      // Check if the request has a special header or parameter for testing
      const useRealAuth = request.headers.get('x-use-real-auth') === 'true' || 
                         new URL(request.url).searchParams.get('useRealAuth') === 'true';
      
      if (!useRealAuth) {
        logWithTimestamp('Using development mock admin account');
        // Return a mock admin response for development
        const mockResponse = NextResponse.json(
          { 
            success: true,
            admin: {
              id: 'dev-admin-id',
              email: 'dev@example.com',
              firstName: 'Development',
              lastName: 'Admin',
              role: 'admin'
            }
          },
          { status: 200 }
        );
        
        // Set mock cookies for development
        return setAuthCookies(
          mockResponse, 
          'dev-mock-token', 
          'dev-mock-refresh-token'
        );
      }
      
      logWithTimestamp('Development mode with real auth requested');
    }
    
    // Check if user is already authenticated with NextAuth
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        logWithTimestamp('User already authenticated via NextAuth', { userId: session.user.id });
        
        // If this is a revalidation request, return the existing session info
        const isRevalidation = request.headers.get('x-revalidate') === 'true' || 
                              new URL(request.url).searchParams.get('revalidate') === 'true';
        
        if (isRevalidation) {
          logWithTimestamp('Revalidation request detected, returning existing session');
          return NextResponse.json(
            { 
              success: true,
              admin: {
                id: session.user.id,
                email: session.user.email,
              }
            },
            { status: 200 }
          );
        }
        
        // Otherwise, we'll continue with the login flow to set up custom tokens as well
        logWithTimestamp('Existing session found, will also set up custom tokens');
      }
    } catch (sessionError) {
      // Non-critical error, log but continue with normal login flow
      logWithTimestamp('Error checking NextAuth session', { error: String(sessionError) });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      logWithTimestamp('Error parsing request body', { error: String(parseError) });
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    // Validate input against schema
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
      logWithTimestamp('Request validated successfully', { email: validatedData.email });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        logWithTimestamp('Validation error', { errors: validationError.errors });
        return NextResponse.json(
          { error: "Invalid input", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    // Validate admin credentials
    logWithTimestamp('Validating admin credentials');
    const admin = await validateAdminCredentials(
      validatedData.email,
      validatedData.password
    );
    
    if (!admin) {
      logWithTimestamp('Invalid credentials', { email: validatedData.email });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    logWithTimestamp('Admin authenticated successfully', { adminId: admin.id });
    
    // Generate JWT token
    let token;
    try {
      token = await encrypt({ 
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      });
      logWithTimestamp('JWT token generated successfully');
    } catch (tokenError) {
      logWithTimestamp('Error generating JWT token', { error: String(tokenError) });
      return NextResponse.json(
        { error: "Authentication system error" },
        { status: 500 }
      );
    }
    
    // Generate refresh token
    let refreshToken;
    try {
      refreshToken = await generateRefreshToken(admin.id);
      logWithTimestamp('Refresh token generated successfully');
    } catch (refreshTokenError) {
      logWithTimestamp('Error generating refresh token', { error: String(refreshTokenError) });
      return NextResponse.json(
        { error: "Authentication system error" },
        { status: 500 }
      );
    }
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        }
      },
      { status: 200 }
    );
    
    // Set auth cookies
    logWithTimestamp('Setting authentication cookies');
    return setAuthCookies(response, token, refreshToken);
  } catch (error) {
    logWithTimestamp('Unexpected login error', { error: String(error) });
    
    return NextResponse.json(
      { error: "Authentication failed", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
