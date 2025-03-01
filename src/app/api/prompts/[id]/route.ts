import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma/client"

export async function GET(
  request: Request
) {
  try {
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        promptTools: {
          include: {
            tool: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            copies: true,
          },
        },
      },
    })

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Get prompt error:", error)
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request
) {
  try {
    // Extract ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const prompt = await prisma.prompt.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Prompt deleted successfully",
      prompt,
    })
  } catch (error) {
    console.error("Delete prompt error:", error)
    return NextResponse.json(
      { error: "Failed to delete prompt" },
      { status: 500 }
    )
  }
}
