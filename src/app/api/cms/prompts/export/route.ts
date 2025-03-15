import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";

// GET - Export prompts to CSV
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
    
    // Get prompt IDs from query params (optional)
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");
    const promptIds = idsParam ? idsParam.split(",") : undefined;
    
    // Fetch prompts with related data
    const prompts = await prisma.prompt.findMany({
      where: {
        ...(promptIds ? { id: { in: promptIds } } : {}),
        deletedAt: null,
      },
      include: {
        categories: {
          include: {
            category: true,
            subcategory: true,
          },
        },
        keywords: true,
        tools: {
          include: {
            tool: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Create CSV header
    const headers = [
      "id",
      "titleEn",
      "titleAr",
      "descriptionEn",
      "descriptionAr",
      "instructionEn",
      "instructionAr",
      "promptTextEn",
      "promptTextAr",
      "isPro",
      "copyCount",
      "initialCopyCount",
      "createdAt",
      "updatedAt",
      "categoryId",
      "categoryNameEn",
      "categoryNameAr",
      "subcategoryId",
      "subcategoryNameEn",
      "subcategoryNameAr",
      "keywords",
      "tools"
    ];
    
    // Create CSV rows
    const rows = prompts.map(prompt => {
      // Process keywords
      const keywords = prompt.keywords.map(k => k.keyword).join(",");
      
      // Process tools
      const tools = prompt.tools.map(t => t.tool.name).join(",");
      
      // Get category and subcategory info
      const category = prompt.categories[0]?.category;
      const subcategory = prompt.categories[0]?.subcategory;
      
      // Format date strings
      const createdAt = prompt.createdAt.toISOString();
      const updatedAt = prompt.updatedAt.toISOString();
      
      // Escape text fields that might contain commas or quotes
      const escapeCSV = (text: string | null) => {
        if (text === null) return "";
        // If text contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
        if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      
      return [
        prompt.id,
        escapeCSV(prompt.titleEn),
        escapeCSV(prompt.titleAr),
        escapeCSV(prompt.descriptionEn),
        escapeCSV(prompt.descriptionAr),
        escapeCSV(prompt.instructionEn),
        escapeCSV(prompt.instructionAr),
        escapeCSV(prompt.promptTextEn),
        escapeCSV(prompt.promptTextAr),
        prompt.isPro ? "TRUE" : "FALSE",
        prompt.copyCount,
        prompt.initialCopyCount,
        createdAt,
        updatedAt,
        category?.id || "",
        escapeCSV(category?.nameEn || ""),
        escapeCSV(category?.nameAr || ""),
        subcategory?.id || "",
        escapeCSV(subcategory?.nameEn || ""),
        escapeCSV(subcategory?.nameAr || ""),
        escapeCSV(keywords),
        escapeCSV(tools)
      ].join(",");
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows
    ].join("\n");
    
    // Set response headers for CSV download
    const headers_response = new Headers();
    headers_response.set("Content-Type", "text/csv");
    headers_response.set("Content-Disposition", `attachment; filename=prompts-export-${new Date().toISOString().split("T")[0]}.csv`);
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: headers_response
    });
  } catch (error) {
    console.error("Error exporting prompts:", error);
    return NextResponse.json(
      { error: "Failed to export prompts" },
      { status: 500 }
    );
  }
}
