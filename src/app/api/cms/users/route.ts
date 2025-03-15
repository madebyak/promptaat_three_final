import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { Prisma } from "@prisma/client";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;
    
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    const [users, total, activeUsers, inactiveUsers, subscribedUsers] = await Promise.all([
      prisma.user.findMany({
        where,
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
          subscriptions: {
            where: {
              OR: [
                {
                  status: "active",
                  currentPeriodEnd: {
                    gt: new Date(),
                  },
                },
                {
                  status: "trialing",
                  currentPeriodEnd: {
                    gt: new Date(),
                  },
                }
              ]
            },
            select: {
              id: true,
              status: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              plan: true,
              interval: true,
              stripePriceId: true,
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.count({
        where: {
          ...where,
          subscriptions: {
            some: {
              OR: [
                {
                  status: "active",
                  currentPeriodEnd: {
                    gt: new Date(),
                  },
                },
                {
                  status: "trialing",
                  currentPeriodEnd: {
                    gt: new Date(),
                  },
                }
              ]
            },
          },
        },
      }),
    ]);
    
    // Transform the users data to match the expected format
    const transformedUsers = users.map(user => ({
      ...user,
      subscription: user.subscriptions && user.subscriptions.length > 0 
        ? {
            id: user.subscriptions[0].id,
            status: user.subscriptions[0].status,
            startDate: user.subscriptions[0].currentPeriodStart,
            endDate: user.subscriptions[0].currentPeriodEnd,
            planId: user.subscriptions[0].stripePriceId || "",
            plan: user.subscriptions[0].plan,
            interval: user.subscriptions[0].interval,
          }
        : null,
      subscriptions: undefined, // Remove the subscriptions array from the response
    }));
    
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      stats: {
        total,
        active: activeUsers,
        inactive: inactiveUsers,
        subscribed: subscribedUsers,
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    );
  }
}
