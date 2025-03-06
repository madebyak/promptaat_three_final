import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { z } from "zod"

const toolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  icon: z.string().min(1),
  isPublished: z.boolean().optional(),
})

type ToolData = {
  id: string
  name: string
  description: string | null
  iconName: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  iconUrl: string | null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const isPublished = searchParams.get("isPublished")

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(isPublished !== null && { isPublished: isPublished === "true" }),
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }) as unknown as Promise<ToolData[]>,
      prisma.tool.count({ where }),
    ])

    return NextResponse.json({
      data: tools,
      total,
      page,
      limit,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Get tools error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.error("Get tools error:", error)
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const validatedData = toolSchema.parse(data)

    const tool = await prisma.tool.create({
      data: validatedData,
    })

    return NextResponse.json(tool)
  } catch (error) {
    console.error("Create tool error:", error)
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, ...updateData } = data
    const validatedData = toolSchema.partial().parse(updateData)

    const tool = await prisma.tool.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(tool)
  } catch (error) {
    console.error("Update tool error:", error)
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      )
    }

    await prisma.tool.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Tool deleted successfully",
    })
  } catch (error) {
    console.error("Delete tool error:", error)
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    )
  }
}
