import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { comparePasswords } from "@/lib/crypto";

// Get the JWT secret with proper fallback and logging
const getAdminJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    console.warn('[ADMIN AUTH WARNING] ADMIN_JWT_SECRET is not set. Using fallback secret. This is not secure for production.');
    return "fallback-secret-key-for-admin";
  }
  return secret;
};

const secretKey = getAdminJwtSecret();
const key = new TextEncoder().encode(secretKey);

// Login schema for validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false),
});

// Define a type for the JWT payload to avoid using 'any'
type JWTPayload = {
  adminId: string;
  email: string;
  role?: string;
  exp?: number;
  [key: string]: unknown; // Allow for additional properties if needed
};

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Short expiration time for security
    .sign(key);
}

export async function decrypt(token: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Attempting to decrypt token...`);
  
  // For development environments, we can bypass jwt verification
  const isDev = process.env.NODE_ENV === 'development';
  
  // Return mock admin payload in development mode regardless
  if (isDev) {
    console.log(`[${timestamp}] DEV MODE: Returning mock admin payload`);
    return {
      adminId: 'dev-admin-id',
      email: 'dev@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
  }
  
  // Validate token
  if (!token || typeof token !== 'string' || token.trim() === '') {
    console.log(`[${timestamp}] Token validation failed: token is empty or not a string`);
    return null;
  }
  
  try {
    // Add more detailed logging for debugging
    console.log(`[${timestamp}] Verifying JWT token with algorithm HS256`);
    
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    
    // Log successful decryption with minimal payload info for security
    console.log(`[${timestamp}] Token successfully decrypted. Payload contains adminId: ${!!payload.adminId}`);
    return payload;
  } catch (error) {
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${timestamp}] JWT verification error:`, errorMessage);
    
    // Log additional context for troubleshooting
    if (error instanceof Error && error.message.includes('signature')) {
      console.error(`[${timestamp}] This may indicate a mismatch between the token signature and the current ADMIN_JWT_SECRET`);
    } else if (error instanceof Error && error.message.includes('expired')) {
      console.error(`[${timestamp}] Token has expired. User needs to log in again.`);
    }
    
    return null;
  }
}

// Generate a refresh token
export async function generateRefreshToken(adminId: string) {
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Longer expiration for refresh token
    .sign(key);
  
  return token;
}

// Validate admin credentials
export async function validateAdminCredentials(email: string, password: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Validating admin credentials for email: ${email}`);
  
  try {
    // Find the admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email, isActive: true },
    });

    if (!admin) {
      console.log(`[${timestamp}] No active admin found with email: ${email}`);
      return null;
    }

    // Verify the password
    console.log(`[${timestamp}] Verifying password for admin: ${admin.id}`);
    const passwordMatch = await comparePasswords(password, admin.passwordHash);
    
    if (!passwordMatch) {
      console.log(`[${timestamp}] Password verification failed for admin: ${admin.id}`);
      return null;
    }

    // Update last login time
    try {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateError) {
      // Non-critical error, log but continue
      console.error(`[${timestamp}] Failed to update last login time:`, updateError);
    }

    // Create audit log for login
    try {
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "login",
          entityType: "admin",
          entityId: admin.id,
          details: { ip: "system" },
        },
      });
    } catch (auditError) {
      // Non-critical error, log but continue
      console.error(`[${timestamp}] Failed to create audit log:`, auditError);
    }

    console.log(`[${timestamp}] Admin authentication successful: ${admin.id}`);
    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
    };
  } catch (error) {
    console.error(`[${timestamp}] Error in validateAdminCredentials:`, error);
    return null;
  }
}

// Set auth cookies - server-side only
export function setAuthCookies(
  response: NextResponse,
  token: string,
  refreshToken: string
) {
  response.cookies.set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set({
    name: "admin_refresh_token",
    value: refreshToken,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}

// Clear auth cookies - server-side only
export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: "admin_token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  response.cookies.set({
    name: "admin_refresh_token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });

  return response;
}

// Server-side only functions
export async function getServerSideCookies(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("admin_refresh_token")?.value;
  return { token, refreshToken };
}

export async function getCurrentAdminServerSide(request: NextRequest) {
  const { token } = await getServerSideCookies(request);
  const isDev = process.env.NODE_ENV === 'development';
  
  console.log(`[${new Date().toISOString()}] getCurrentAdminServerSide: Token present:`, !!token);
  
  // In development, always return a mock admin
  if (isDev) {
    console.log(`[${new Date().toISOString()}] DEV MODE: Always returning mock admin in getCurrentAdminServerSide`);
    return {
      id: 'dev-admin-id',
      email: 'dev@example.com',
      firstName: 'Development',
      lastName: 'Admin',
      role: 'admin'
    };
  }
  
  // Production flow - require valid token
  if (!token) {
    return null;
  }
  
  const payload = await decrypt(token);
  
  if (!payload) {
    return null;
  }
  
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId as string, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    if (!admin) {
      return null;
    }
    
    return admin;
  } catch (dbError) {
    console.error(`[${new Date().toISOString()}] Database error in getCurrentAdminServerSide:`, dbError);
    return null;
  }
}

export async function refreshAccessTokenServerSide(request: NextRequest) {
  try {
    const { refreshToken } = await getServerSideCookies(request);
    
    if (!refreshToken) {
      return null;
    }
    
    const payload = await decrypt(refreshToken);
    if (!payload) {
      return null;
    }
    
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId as string, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    if (!admin) {
      return null;
    }
    
    // Generate new access token
    const newToken = await encrypt({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });
    
    return { token: newToken, admin };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
