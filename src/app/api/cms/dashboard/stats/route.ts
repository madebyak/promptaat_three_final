import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [promptsCount, categoriesCount, usersCount] = await Promise.all([
      prisma.prompt.count(),
      prisma.category.count(),
      prisma.user.count()
    ])

    return NextResponse.json({
      promptsCount,
      categoriesCount,
      usersCount
    })
  } catch (error) {
    console.error("Dashboard stats error:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
