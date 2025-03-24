import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export interface RetentionCohortResponse {
  success: boolean;
  data?: {
    cohort: string;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week5: number;
    week6: number;
    week7: number;
    week8: number;
  }[];
  error?: string;
}

/**
 * Get user retention cohort data
 * 
 * Retrieves user retention data by cohorts over weeks
 * @returns User retention cohort data
 */
export async function GET(): Promise<NextResponse<RetentionCohortResponse>> {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate cohort dates (last 4 months by default)
    const today = new Date();
    const cohortMonths = 4; // Number of cohorts to analyze
    const cohortData = [];

    for (let i = 0; i < cohortMonths; i++) {
      // Create cohort start date (first day of month)
      const cohortDate = new Date(today);
      cohortDate.setMonth(today.getMonth() - i);
      cohortDate.setDate(1);
      cohortDate.setHours(0, 0, 0, 0);
      
      // Create cohort end date (last day of month)
      const cohortEndDate = new Date(cohortDate);
      cohortEndDate.setMonth(cohortEndDate.getMonth() + 1);
      cohortEndDate.setDate(0);
      cohortEndDate.setHours(23, 59, 59, 999);

      // Get users who signed up in this cohort
      const cohortUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: cohortDate,
            lte: cohortEndDate,
          },
          deletedAt: null, // Only include active users
        },
        select: {
          id: true,
        },
      });

      const cohortUserIds = cohortUsers.map(user => user.id);
      const totalCohortUsers = cohortUserIds.length;
      
      if (totalCohortUsers === 0) continue; // Skip empty cohorts

      // Calculate retention for each week
      const weeklyRetention = [];
      
      for (let week = 1; week <= 8; week++) {
        // Calculate the date range for this week
        const weekStartDate = new Date(cohortDate);
        weekStartDate.setDate(weekStartDate.getDate() + (week - 1) * 7);
        
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        weekEndDate.setHours(23, 59, 59, 999);
        
        // Skip weeks that are in the future
        if (weekStartDate > today) {
          weeklyRetention.push(null);
          continue;
        }

        // Use UserHistory to find active users in this week
        const activeUserHistories = await prisma.userHistory.findMany({
          where: {
            userId: {
              in: cohortUserIds,
            },
            createdAt: {
              gte: weekStartDate,
              lte: weekEndDate,
            },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'], // Get unique users only
        });
        
        // Count unique users who were active during this week
        const activeUserCount = activeUserHistories.length;
        
        // Calculate retention percentage
        const retentionRate = Math.round((activeUserCount / totalCohortUsers) * 100);
        weeklyRetention.push(retentionRate);
      }
      
      // Format cohort label
      const cohortLabel = `${cohortDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
      
      // Create cohort data entry
      cohortData.push({
        cohort: cohortLabel,
        week1: weeklyRetention[0] ?? 0,
        week2: weeklyRetention[1] ?? 0,
        week3: weeklyRetention[2] ?? 0,
        week4: weeklyRetention[3] ?? 0,
        week5: weeklyRetention[4] ?? 0,
        week6: weeklyRetention[5] ?? 0,
        week7: weeklyRetention[6] ?? 0,
        week8: weeklyRetention[7] ?? 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: cohortData.reverse(), // Show newest cohorts first
    });
  } catch (error) {
    console.error("Error fetching retention data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch retention data",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
