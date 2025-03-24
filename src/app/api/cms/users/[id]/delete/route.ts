import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

export const runtime = 'nodejs';

// Permanently delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user ID from params
    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Store user email for audit log
    const userEmail = user.email;

    // Delete related records first to avoid foreign key constraints
    // This assumes your database schema has cascading deletes or you need to manually delete related records

    // 1. Delete user subscriptions
    await prisma.subscription.deleteMany({
      where: { userId },
    });

    // 2. Delete user prompts
    await prisma.prompt.deleteMany({
      where: { 
        catalogs: {
          some: {
            catalog: {
              userId
            }
          }
        } 
      },
    });

    // 3. Delete user prompt bookmarks and history
    await prisma.userBookmark.deleteMany({
      where: { userId },
    });
    
    await prisma.userHistory.deleteMany({
      where: { userId },
    });

    // 4. Delete any other user-related records
    // Add more deleteMany operations for other tables as needed

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE_USER",
        entityType: "user",
        entityId: userId,
        details: {
          email: userEmail,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: (error as Error).message },
      { status: 500 }
    );
  }
}
