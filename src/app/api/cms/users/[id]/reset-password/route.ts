import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { hashPassword, generateRandomString } from "@/lib/crypto";

export const runtime = 'nodejs';

export async function POST(
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
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate a random password
    const newPassword = await generateRandomString(12);
    
    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user with new password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Log the action in audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "RESET_USER_PASSWORD",
        entityType: "USER",
        entityId: userId,
        details: {
          userId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password has been reset successfully",
      temporaryPassword: newPassword
    });
  } catch (error) {
    console.error("Reset user password error:", error);
    
    return NextResponse.json(
      { error: "Failed to reset user password" },
      { status: 500 }
    );
  }
}
