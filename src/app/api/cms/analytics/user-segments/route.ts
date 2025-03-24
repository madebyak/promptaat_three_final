import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export interface UserSegmentResponse {
  success: boolean;
  data?: {
    name: string;
    value: number;
    color: string;
  }[];
  error?: string;
}

/**
 * Get user segments data
 * 
 * Retrieves user segments based on activity levels and engagement
 * @returns User segments data
 */
export async function GET(): Promise<NextResponse<UserSegmentResponse>> {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Define segment colors
    const colors = {
      power: "#8884d8",
      active: "#82ca9d",
      occasional: "#ffc658",
      inactive: "#ff8042",
      new: "#0088fe"
    };

    // Count total active users
    const totalUsers = await prisma.user.count({
      where: {
        isActive: true,
        deletedAt: null,
      }
    });
    
    // Get current date for calculations
    const now = new Date();
    
    // Calculate date thresholds
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(now.getDate() - 90);
    
    const newUserThreshold = new Date(now);
    newUserThreshold.setDate(now.getDate() - 14); // Users registered within last 14 days
    
    // Query for new users (registered in the last 14 days)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: newUserThreshold
        },
        isActive: true,
        deletedAt: null,
      }
    });
    
    // Find user activity using Prisma's type-safe queries
    // Get all user history entries in the last 30 days
    const recentHistory = await prisma.userHistory.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        user: {
          isActive: true,
          deletedAt: null
        }
      },
      select: {
        userId: true,
      }
    });
    
    // Count activities per user
    const userActivityCounts = recentHistory.reduce((acc, item) => {
      acc[item.userId] = (acc[item.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get unique active users
    const activeUserIds = Object.keys(userActivityCounts);
    
    // Categorize users based on activity count
    const powerUsers = activeUserIds.filter(id => userActivityCounts[id] > 10).length;
    const activeUsers = activeUserIds.filter(id => userActivityCounts[id] >= 5 && userActivityCounts[id] <= 10).length;
    const occasionalUsers = activeUserIds.filter(id => userActivityCounts[id] >= 1 && userActivityCounts[id] < 5).length;
    
    // Get users with activity between 30 and 90 days ago
    const olderHistory = await prisma.userHistory.findMany({
      where: {
        createdAt: {
          gte: ninetyDaysAgo,
          lt: thirtyDaysAgo
        },
        user: {
          isActive: true,
          deletedAt: null
        }
      },
      select: {
        userId: true,
      },
      distinct: ['userId']
    });
    
    // Get all older active user IDs
    const olderActiveUserIds = olderHistory.map(item => item.userId);
    
    // Inactive users (no activity in last 30 days but had activity before)
    const inactiveUserIds = olderActiveUserIds.filter(id => !activeUserIds.includes(id));
    const inactiveUsers = inactiveUserIds.length;
    
    // Dormant users (the rest - no activity in 90+ days or never active)
    const dormantUsers = totalUsers - (newUsers + powerUsers + activeUsers + occasionalUsers + inactiveUsers);
    
    // Prepare the data for the response
    const segmentData = [
      {
        name: "Power Users",
        value: powerUsers,
        color: colors.power
      },
      {
        name: "Active Users",
        value: activeUsers,
        color: colors.active
      },
      {
        name: "Occasional Users",
        value: occasionalUsers,
        color: colors.occasional
      },
      {
        name: "Inactive Users",
        value: inactiveUsers,
        color: colors.inactive
      },
      {
        name: "New Users",
        value: newUsers,
        color: colors.new
      },
      {
        name: "Dormant Users",
        value: dormantUsers >= 0 ? dormantUsers : 0, // Ensure value isn't negative
        color: "#cccccc" // Gray color for dormant users
      }
    ];

    return NextResponse.json({
      success: true,
      data: segmentData,
    });
  } catch (error) {
    console.error("Error fetching user segments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user segments data",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
