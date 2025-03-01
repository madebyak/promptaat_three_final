import { cookies } from "next/headers";
import { decrypt } from "./admin-auth";
import { prisma } from "@/lib/db";

// Get current admin from token - server-side only
export async function getCurrentAdmin() {
  // For development environments, we can bypass authentication
  const isDev = process.env.NODE_ENV === 'development';
  console.log(`[${new Date().toISOString()}] getCurrentAdmin called, isDev:`, isDev);
  
  // This function should only be called from server components or API routes
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  console.log(`[${new Date().toISOString()}] getCurrentAdmin: Token present:`, !!token);
  
  if (!token) {
    // In development, create a mock admin for testing
    if (isDev) {
      console.log(`[${new Date().toISOString()}] DEV MODE: Creating mock admin in getCurrentAdmin`);
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
  
  const payload = await decrypt(token);
  if (!payload) {
    // In development, create a mock admin for testing
    if (isDev) {
      console.log(`[${new Date().toISOString()}] DEV MODE: Creating mock admin in getCurrentAdmin after failed payload`);
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
  } catch (dbError) {
    console.error(`[${new Date().toISOString()}] Database error in getCurrentAdmin:`, dbError);
    
    // In development, create a mock admin for testing
    if (isDev) {
      console.log(`[${new Date().toISOString()}] DEV MODE: Creating mock admin in getCurrentAdmin after DB error`);
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
