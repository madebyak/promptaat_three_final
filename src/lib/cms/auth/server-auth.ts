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
 * Gets the current admin user from the session.
 * 
 * This function will check for a valid session and then verify if the user
 * exists in the admin_users table. All admin users must be properly registered
 * in the database with appropriate credentials.
 * 
 * @returns The admin user object or null if not authenticated
 */
export async function getCurrentAdmin() {
  const timestamp = new Date().toISOString();
  
  // Log function entry for debugging
  console.log(`[${timestamp}] getCurrentAdmin called`);
  
  try {
    // First, try to get the user from NextAuth session
    // This should be the primary authentication method after our changes
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log(`[${timestamp}] NextAuth session check result:`, session ? "Session found" : "No session");
    } catch (sessionError) {
      console.error(`[${timestamp}] Error retrieving NextAuth session:`, sessionError);
      session = null;
    }
    
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
        console.log(`[${timestamp}] Admin found in database for email: ${userEmail}`);
        return admin;
      } else {
        console.log(`[${timestamp}] No admin found in database for email: ${userEmail}`);
      }
    }
    
    console.log(`[${timestamp}] NextAuth session check failed or no admin found, trying custom token authentication`);
    
    // As a fallback (for compatibility), try to get admin from token
    let token = null;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_token")?.value;
    } catch (cookieError) {
      console.error(`[${timestamp}] Error accessing cookies:`, cookieError);
    }
    
    // If no token is present
    if (!token) {
      console.log(`[${timestamp}] No custom token found, authentication failed`);
      return null;
    }
    
    // Try to decrypt the token
    let payload = null;
    try {
      payload = await decrypt(token);
    } catch (decryptError) {
      console.error(`[${timestamp}] Error decrypting token:`, decryptError);
    }
    
    // If token decryption failed
    if (!payload) {
      console.log(`[${timestamp}] Token decryption failed or returned null payload`);
      return null;
    }
    
    const adminId = payload.adminId as string;
    console.log(`[${timestamp}] Token decrypted successfully, adminId: ${adminId}`);
    
    // Use the safe database operation function to handle errors gracefully
    const admin = await safeDbOperation(async () => {
      return await prisma.adminUser.findUnique({
        where: { id: adminId, isActive: true },
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
      console.log(`[${timestamp}] Admin found in database via token authentication: ${admin.email}`);
    } else {
      console.log(`[${timestamp}] No admin found in database for adminId: ${adminId}`);
    }
    
    return admin;
  } catch (error) {
    console.error(`[${timestamp}] Critical error in getCurrentAdmin:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
