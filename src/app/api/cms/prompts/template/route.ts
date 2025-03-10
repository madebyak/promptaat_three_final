import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

// GET - Download CSV template for prompts
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
      "categoryId",
      "subcategoryId",
      "keywords"
    ];
    
    // Create sample row (leave id empty for new prompts)
    const sampleRow = [
      "",
      "Sample Title",
      "عنوان نموذجي",
      "Sample Description",
      "وصف نموذجي",
      "Sample Instruction",
      "تعليمات نموذجية",
      "This is a sample prompt text that demonstrates the expected format.",
      "هذا نص تلقائي نموذجي يوضح التنسيق المتوقع.",
      "FALSE",
      "", // categoryId (optional)
      "", // subcategoryId (optional)
      "keyword1,keyword2,keyword3" // comma-separated keywords
    ];
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      sampleRow.join(",")
    ].join("\n");
    
    // Set response headers for CSV download
    const headers_response = new Headers();
    headers_response.set("Content-Type", "text/csv");
    headers_response.set("Content-Disposition", "attachment; filename=prompts-template.csv");
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: headers_response
    });
  } catch (error) {
    console.error("Error generating CSV template:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV template" },
      { status: 500 }
    );
  }
}
