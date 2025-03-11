import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { decrypt } from "@/lib/cms/auth/admin-auth";

/**
 * API route to fetch dashboard metrics
 * Requires admin authentication
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin || false;
    
    // Check for admin token in headers
    const authHeader = request.headers.get("authorization");
    let adminTokenValid = false;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await decrypt(token);
        adminTokenValid = !!payload;
      } catch (error) {
        console.error("Admin token verification error:", error);
      }
    }
    
    // If not authenticated as admin, return 401
    if (!isAdmin && !adminTokenValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Fetch metrics in parallel for better performance
    const [
      promptCount,
      userCount,
      categoryCount,
      subcategoryCount,
      promptUsage,
      recentPrompts
    ] = await Promise.all([
      // Total prompts count
      prisma.prompt.count(),
      
      // Total users count
      prisma.user.count(),
      
      // Total categories count
      prisma.category.count({
        where: { parentId: null }
      }),
      
      // Total subcategories count
      prisma.category.count({
        where: { NOT: { parentId: null } }
      }),
      
      // Total prompt usage (sum of copyCount)
      prisma.prompt.aggregate({
        _sum: {
          copyCount: true
        }
      }),
      
      // Recent popular prompts (top 5 by copyCount)
      prisma.prompt.findMany({
        select: {
          id: true,
          titleEn: true,
          titleAr: true,
          copyCount: true,
          createdAt: true
        },
        orderBy: {
          copyCount: 'desc'
        },
        take: 5
      })
    ]);
    
    // Format the response
    return NextResponse.json({
      metrics: {
        promptCount,
        userCount,
        categoryCount,
        subcategoryCount,
        totalCategories: categoryCount + subcategoryCount,
        promptUsage: promptUsage._sum.copyCount || 0,
        recentPrompts
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
