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
    
    const [users, total] = await Promise.all([
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
              plan: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    );
  }
}
