import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] Categories Test: Attempting to fetch categories...`);
    
    // Skip auth for testing and fetch a limited number of categories
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      take: 5, // Limit to 5 for testing
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        iconName: true,
        sortOrder: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log(`[${new Date().toISOString()}] Categories Test: Found ${categories.length} categories`);
    
    // Format categories for frontend
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.nameEn,
      nameAr: cat.nameAr || "",
      iconName: cat.iconName || "",
      order: cat.sortOrder,
      parentId: cat.parentId,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      categories: formattedCategories,
      rawCategories: categories,
      count: categories.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Categories Test Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
