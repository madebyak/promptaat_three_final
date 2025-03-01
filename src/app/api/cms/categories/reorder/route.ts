import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    
    // Validate request body
    if (!Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid request body. Expected an array of categories." },
        { status: 400 }
      );
    }

    // Validate each category in the array
    for (const category of body.categories) {
      if (!category.id || typeof category.sortOrder !== 'number') {
        return NextResponse.json(
          { success: false, message: "Each category must have an id and sortOrder." },
          { status: 400 }
        );
      }
    }

    // Update categories in a transaction
    const result = await prisma.$transaction(
      body.categories.map((category: { id: string; sortOrder: number }) => 
        prisma.category.update({
          where: { id: category.id },
          data: { sortOrder: category.sortOrder },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Categories reordered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error reordering categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder categories" },
      { status: 500 }
    );
  }
} 