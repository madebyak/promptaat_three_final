import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

export interface GeoDistributionResponse {
  success: boolean;
  data?: {
    country: string;
    users: number;
  }[];
  error?: string;
}

/**
 * Get geographical distribution of users
 * 
 * Retrieves user count by country
 * @returns User geographical distribution data
 */
export async function GET(): Promise<NextResponse<GeoDistributionResponse>> {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Query for users with country information directly from the User model
    const usersByCountry = await prisma.user.groupBy({
      by: ['country'],
      _count: {
        id: true // Count by ID instead of country
      },
      where: {
        country: {
          not: undefined, // Check for undefined instead of null
        },
        deletedAt: {
          equals: null // Properly check for null values
        },
      },
      orderBy: {
        _count: {
          id: 'desc' // Order by ID count
        }
      },
      take: 10, // Top 10 countries
    });

    // Format the data for the response
    const geoData = usersByCountry.map(item => ({
      country: item.country,
      users: item._count.id // Use id count
    }));

    // Add an "Other" category for countries outside the top 10
    const totalUsersWithCountry = await prisma.user.count({
      where: {
        country: {
          not: undefined, // Check for undefined instead of null
        },
        deletedAt: {
          equals: null // Properly check for null values
        },
      },
    });

    const topCountriesTotal = geoData.reduce((sum, item) => sum + item.users, 0);
    const otherCountriesCount = totalUsersWithCountry - topCountriesTotal;

    if (otherCountriesCount > 0) {
      geoData.push({
        country: "Other",
        users: otherCountriesCount
      });
    }

    return NextResponse.json({
      success: true,
      data: geoData,
    });
  } catch (error) {
    console.error("Error fetching geographical distribution data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch geographical distribution data",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
