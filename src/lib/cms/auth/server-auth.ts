import { cookies } from "next/headers";
import { decrypt } from "./admin-auth";
import { prisma } from "@/lib/db";

// Improved error handling for database operations
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T | null = null): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Database operation failed:`, error);
    return fallback;
  }
}

/**
 * Gets the current admin user from the token or creates a development admin in dev mode.
 * 
 * This function has different behavior based on the environment:
 * - In production: Requires a valid admin token to authenticate
 * - In development: Falls back to a mock admin account if no token is present
 * 
 * @returns The admin user object or null if not authenticated
 */
export async function getCurrentAdmin() {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();
  
  // Get the admin token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  // Log authentication attempt for debugging
  console.log(`[${timestamp}] Admin auth attempt - Token present: ${!!token}, Dev mode: ${isDev}`);
  
  // Create a mock admin account for development
  const createDevAdmin = () => {
    console.log(`[${timestamp}] DEVELOPMENT MODE: Using mock admin account (dev@example.com)`);
    console.log(`[${timestamp}] WARNING: This is a development-only account and should not be used in production`);
    return {
      id: 'dev-admin-id',
      email: 'dev@example.com',
      firstName: 'Development',
      lastName: 'Admin',
      role: 'admin'
    };
  };
  
  // If no token is present
  if (!token) {
    // In development, create a mock admin for testing
    // In production, this would return null and redirect to login
    return isDev ? createDevAdmin() : null;
  }
  
  // Try to decrypt the token
  const payload = await decrypt(token);
  
  // If token decryption failed
  if (!payload) {
    console.log(`[${timestamp}] Token decryption failed`);
    // In development, create a mock admin for testing
    // In production, this would return null and redirect to login
    return isDev ? createDevAdmin() : null;
  }
  
  // Use the safe database operation function to handle errors gracefully
  const admin = await safeDbOperation(async () => {
    return await prisma.adminUser.findUnique({
      where: { id: payload.adminId as string, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
  });
  
  // In development mode, create a mock admin if no admin is found
  if (!admin && isDev) {
    console.log(`[${new Date().toISOString()}] DEV MODE: No admin found in DB, creating mock admin`);
    return {
      id: 'dev-admin-id',
      email: 'dev@example.com',
      firstName: 'Development',
      lastName: 'Admin',
      role: 'admin'
    };
  }
  
  return admin;
}
