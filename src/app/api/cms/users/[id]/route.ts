import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        country: true,
        occupation: true,
        _count: {
          select: {
            bookmarks: true,
            history: true,
            catalogs: true,
          },
        },
        subscription: {
          where: {
            status: "active",
            endDate: {
              gt: new Date(),
            },
          },
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            planId: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
