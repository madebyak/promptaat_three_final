import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export interface ActivationRateResponse {
  success: boolean;
  data?: {
    date: string;
    rate: number;
    totalUsers: number;
    activatedUsers: number;
  }[];
  error?: string;
}

/**
 * Get user activation rate data
 * 
 * Retrieves the percentage of users who have used at least one prompt
 * @param request NextRequest object
 * @returns User activation rate data
 */
export async function GET(request: NextRequest): Promise<NextResponse<ActivationRateResponse>> {
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
    const startDate = new Date();
    const datePoints = 8; // Number of data points to return

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
      default:
        startDate.setFullYear(today.getFullYear() - 1); // Default to 1 year
    }

    // Calculate the interval between data points
    const interval = Math.ceil((today.getTime() - startDate.getTime()) / (datePoints - 1));
    
    // Generate the data points
    const activationData = [];
    
    for (let i = 0; i < datePoints; i++) {
      const pointDate = new Date(startDate.getTime() + (i * interval));
      
      // Count total users registered by this date (exclude deleted users)
      const totalUsers = await prisma.user.count({
        where: {
          createdAt: {
            lte: pointDate,
          },
          deletedAt: null, // Only count active users
        },
      });
      
      // Count activated users (users who have used at least one prompt through UserHistory)
      // Using a subquery to find users who exist in the UserHistory table
      const activatedUsersQuery = await prisma.user.count({
        where: {
          createdAt: {
            lte: pointDate,
          },
          deletedAt: null, // Only count active users
          isActive: true,
          history: {
            some: {
              createdAt: {
                lte: pointDate,
              },
            },
          },
        },
      });
      
      const activatedUsers = activatedUsersQuery;
      
      // Calculate activation rate
      const rate = totalUsers > 0 ? Math.round((activatedUsers / totalUsers) * 100) : 0;
      
      // Format date based on the range
      let dateFormat: Intl.DateTimeFormatOptions;
      if (range === "month") {
        dateFormat = { month: "short", day: "numeric" };
      } else if (range === "quarter") {
        dateFormat = { month: "short", day: "numeric" };
      } else {
        dateFormat = { year: "numeric", month: "short" };
      }
      
      const formattedDate = pointDate.toLocaleDateString("en-US", dateFormat);
      
      activationData.push({
        date: formattedDate,
        rate,
        totalUsers,
        activatedUsers,
      });
    }

    return NextResponse.json({
      success: true,
      data: activationData,
    });
  } catch (error) {
    console.error("Error fetching activation rate data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activation rate data",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
