import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export interface UserGrowthResponse {
  success: boolean;
  data?: {
    date: string;
    count: number;
  }[];
  error?: string;
}

/**
 * Get user growth data
 * 
 * Retrieves user signups over a specified time period
 * @param request NextRequest object containing query parameters like range
 * @returns User growth data
 */
export async function GET(request: NextRequest): Promise<NextResponse<UserGrowthResponse>> {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the time range from query params (default to "year")
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "year";

    // Calculate the date range based on the selected range
    const today = new Date();
    let startDate = new Date();

    switch (range) {
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setFullYear(today.getFullYear() - 1); // Default to 1 year
    }

    // Query for user growth data
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Process the data for the requested time range
    let userData: { date: string; count: number }[] = [];
    let dateFormat: Intl.DateTimeFormatOptions;

    // Determine date format based on range
    if (range === "month") {
      dateFormat = { month: "short", day: "numeric" };
    } else if (range === "quarter") {
      dateFormat = { month: "short", day: "numeric" };
    } else {
      dateFormat = { year: "numeric", month: "short" };
    }

    // Group users by date
    const usersByDate = new Map<string, number>();

    users.forEach((user) => {
      const date = new Date(user.createdAt);
      const dateKey = date.toLocaleDateString("en-US", dateFormat);
      
      if (usersByDate.has(dateKey)) {
        usersByDate.set(dateKey, usersByDate.get(dateKey)! + 1);
      } else {
        usersByDate.set(dateKey, 1);
      }
    });

    // Convert map to array
    userData = Array.from(usersByDate.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Error fetching user growth data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user growth data",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
