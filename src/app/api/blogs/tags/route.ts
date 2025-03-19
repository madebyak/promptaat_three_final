import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET handler for retrieving all blog tags
export async function GET(request: NextRequest) {
  try {
    // Fetch all distinct tags used in published blogs
    const tags = await prisma.blogTag.findMany({
      where: {
        blog: {
          status: "published",
          publishedAt: { not: null },
          deletedAt: null,
        }
      },
      select: {
        tagName: true,
      },
      distinct: ["tagName"],
      orderBy: {
        tagName: "asc",
      },
    });

    // Count blogs for each tag
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await prisma.blogTag.count({
          where: {
            tagName: tag.tagName,
            blog: {
              status: "published",
              publishedAt: { not: null },
              deletedAt: null,
            }
          },
        });
        
        return {
          name: tag.tagName,
          count
        };
      })
    );

    // Sort tags by blog count (most used first)
    tagsWithCount.sort((a, b) => b.count - a.count);

    return NextResponse.json(
      { data: tagsWithCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/blogs/tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
