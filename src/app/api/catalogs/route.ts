import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"

// GET /api/catalogs - Get all catalogs for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch user's catalogs
    const catalogs = await prisma.catalog.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            prompts: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
    })

    return NextResponse.json(catalogs)
  } catch (error) {
    console.error("Get catalogs error:", error)
    return NextResponse.json(
      { error: "Failed to fetch catalogs" },
      { status: 500 }
    )
  }
}

// POST /api/catalogs - Create a new catalog
export async function POST(
  request: NextRequest,
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: "Catalog name is required" },
        { status: 400 }
      )
    }
    
    // Description is optional, but if provided, it should be a string
    if (description !== undefined && (typeof description !== 'string')) {
      return NextResponse.json(
        { error: "Description must be a string" },
        { status: 400 }
      )
    }

    // Create new catalog
    const catalog = await prisma.catalog.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        ...(description !== undefined ? { description: description.trim() } : {}),
      }
    })

    return NextResponse.json(catalog, { status: 201 })
  } catch (error) {
    console.error("Create catalog error:", error)
    return NextResponse.json(
      { error: "Failed to create catalog" },
      { status: 500 }
    )
  }
}
