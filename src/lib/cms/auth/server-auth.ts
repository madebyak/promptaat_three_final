import { cookies } from "next/headers";
import { decrypt } from "./admin-auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

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
  
  try {
    // First, try to get the user from NextAuth session
    // This should be the primary authentication method after our changes
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const userEmail = session.user.email; // Assign to a const to satisfy TypeScript
      console.log(`[${timestamp}] User authenticated via NextAuth session: ${userEmail}`);
      
      // If we have a valid NextAuth session, try to find the admin user in the database
      const admin = await safeDbOperation(async () => {
        return await prisma.adminUser.findUnique({
          where: { 
            email: userEmail, // Use the const variable which is definitely a string
            isActive: true 
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });
      });
      
      if (admin) {
        return admin;
      }
    }
    
    // As a fallback (for compatibility), try to get admin from token
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    
    // Log authentication attempt for debugging
    console.log(`[${timestamp}] Admin auth attempt via token - Token present: ${!!token}, Dev mode: ${isDev}`);
    
    // Create a mock admin account for development if needed
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
    
    // If in development mode, return a mock admin user
    if (isDev) {
      return createDevAdmin();
    }
    
    // If no token is present in production
    if (!token) {
      return null;
    }
    
    // Try to decrypt the token
    const payload = await decrypt(token);
    
    // If token decryption failed
    if (!payload) {
      console.log(`[${timestamp}] Token decryption failed`);
      return null;
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
    
    return admin;
  } catch (error) {
    console.error(`[${timestamp}] Error in getCurrentAdmin:`, error);
    
    // In development mode, return a mock admin as a fallback
    if (isDev) {
      return {
        id: 'dev-admin-id',
        email: 'dev@example.com',
        firstName: 'Development',
        lastName: 'Admin',
        role: 'admin'
      };
    }
    
    return null;
  }
}
