import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { z } from "zod";

// Schema for prompt creation
const promptCreateSchema = z.object({
  titleEn: z.string().min(3, "Title must be at least 3 characters"),
  titleAr: z.string().min(3, "Arabic title must be at least 3 characters"),
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  instructionEn: z.string().optional().nullable(),
  instructionAr: z.string().optional().nullable(),
  promptTextEn: z.string().min(10, "Prompt text must be at least 10 characters"),
  promptTextAr: z.string().min(10, "Arabic prompt text must be at least 10 characters"),
  isPro: z.boolean().default(false),
  copyCount: z.number().int().nonnegative().default(0),
  categoryId: z.string({
    required_error: "Category is required",
  }),
  subcategoryId: z.string({
    required_error: "Subcategory is required",
  }),
  keywords: z.array(z.string()).optional(),
  toolIds: z.array(z.string()).optional(),
});

type PromptData = {
  id: string;
  titleEn: string;
  titleAr: string;
  isPro: boolean;
  createdAt: Date;
  updatedAt: Date;
  copyCount: number;
  category: {
    id: string;
    nameEn: string;
    nameAr: string;
    name: string;
  } | null;
  subcategory: {
    id: string;
    nameEn: string;
    nameAr: string;
    name: string;
  } | null;
};

export async function GET(request: NextRequest) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    let where: {
      deletedAt: null;
      OR?: Array<Record<string, { contains: string; mode: 'insensitive' }>>;
      categories?: {
        some: {
          categoryId: string;
        };
      };
    } = {
      deletedAt: null, // Only show non-deleted prompts
    };

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: "insensitive" as const } },
        { titleAr: { contains: search, mode: "insensitive" as const } },
        { promptTextEn: { contains: search, mode: "insensitive" as const } },
        { promptTextAr: { contains: search, mode: "insensitive" as const } },
        { descriptionEn: { contains: search, mode: "insensitive" as const } },
        { descriptionAr: { contains: search, mode: "insensitive" as const } },
      ];
    }

    // Handle category filtering
    let categoryFilter = {};
    if (categoryId) {
      categoryFilter = {
        categories: {
          some: {
            categoryId,
          },
        },
      };

      // Merge with existing where clause
      where = { ...where, ...categoryFilter };
    }

    // Build sort options
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    // Get prompts with pagination
    const [prompts, total] = await Promise.all([
      prisma.prompt.findMany({
        where,
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  nameEn: true,
                  nameAr: true,
                },
              },
              subcategory: {
                select: {
                  id: true,
                  nameEn: true,
                  nameAr: true,
                },
              },
            },
            take: 1, // Just get the first category for display purposes
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.prompt.count({ where }),
    ]);

    // Transform the data to a more usable format
    const transformedPrompts: PromptData[] = prompts.map((prompt) => {
      const firstCategory = prompt.categories[0];

      return {
        id: prompt.id,
        titleEn: prompt.titleEn,
        titleAr: prompt.titleAr,
        isPro: prompt.isPro,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        copyCount: prompt.copyCount,
        category: firstCategory && firstCategory.category
          ? {
              id: firstCategory.category.id,
              nameEn: firstCategory.category.nameEn,
              nameAr: firstCategory.category.nameAr,
              name: firstCategory.category.nameEn,
            }
          : null,
        subcategory: firstCategory && firstCategory.subcategory
          ? {
              id: firstCategory.subcategory.id,
              nameEn: firstCategory.subcategory.nameEn,
              nameAr: firstCategory.subcategory.nameAr,
              name: firstCategory.subcategory.nameEn,
            }
          : null,
      } as PromptData;
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      prompts: transformedPrompts,
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
    console.error("Get prompts error:", error);

    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

// POST - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    // Get current admin
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const json = await request.json();

    // Validate input
    const validatedData = promptCreateSchema.safeParse(json);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Extract data
    const {
      categoryId,
      subcategoryId,
      keywords = [],
      toolIds = [],
      ...promptData
    } = validatedData.data;

    // Start a transaction to create everything
    const newPrompt = await prisma.$transaction(async (tx) => {
      // 1. Create the prompt
      const prompt = await tx.prompt.create({
        data: {
          ...promptData,
          initialCopyCount: promptData.copyCount || 0,
          copyCount: promptData.copyCount || 0,
        },
      });

      // 2. Create category relation
      await tx.promptCategory.create({
        data: {
          promptId: prompt.id,
          categoryId,
          subcategoryId,
        },
      });

      // 3. Create keywords
      for (const keyword of keywords) {
        await tx.promptKeyword.create({
          data: {
            promptId: prompt.id,
            keyword,
          },
        });
      }

      // 4. Create tool relations
      for (const toolId of toolIds) {
        await tx.promptTool.create({
          data: {
            promptId: prompt.id,
            toolId,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "create",
          entityType: "prompt",
          entityId: prompt.id,
          details: { promptTitle: promptData.titleEn },
        },
      });

      return prompt;
    });

    return NextResponse.json({
      message: "Prompt created successfully",
      prompt: newPrompt,
    }, { status: 201 });
  } catch (error) {
    console.error("Create prompt error:", error);

    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
