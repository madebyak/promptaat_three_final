import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// POST - Import prompts from CSV
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
    
    // Parse form data (CSV file)
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }
    
    // Read file content
    const text = await file.text();
    const rows = text.split("\n").map(row => row.trim()).filter(Boolean);
    
    // Validate CSV structure
    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV file must contain header row and at least one data row" },
        { status: 400 }
      );
    }
    
    // Parse header row
    const headers = parseCSVRow(rows[0]);
    const requiredHeaders = ["titleEn", "titleAr", "promptTextEn", "promptTextAr"];
    
    // Check for required headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Process data rows
    const dataRows = rows.slice(1);
    const results = {
      success: true,
      imported: 0,
      errors: [] as Array<{ row: number; message: string }>
    };
    
    // Schema for prompt validation
    const promptSchema = z.object({
      titleEn: z.string().min(3, "English title must be at least 3 characters"),
      titleAr: z.string().min(3, "Arabic title must be at least 3 characters"),
      promptTextEn: z.string().min(10, "English prompt text must be at least 10 characters"),
      promptTextAr: z.string().min(10, "Arabic prompt text must be at least 10 characters"),
      descriptionEn: z.string().optional().nullable(),
      descriptionAr: z.string().optional().nullable(),
      instructionEn: z.string().optional().nullable(),
      instructionAr: z.string().optional().nullable(),
      isPro: z.boolean().optional(),
      categoryId: z.string().optional(),
      subcategoryId: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    });
    
    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const rowIndex = i + 2; // +2 because 1-indexed and header row
        const rowData = parseCSVRow(dataRows[i]);
        
        // Create object from CSV row
        const promptData: Record<string, any> = {};
        headers.forEach((header, index) => {
          if (index < rowData.length) {
            promptData[header] = rowData[index];
          }
        });
        
        // Process boolean fields
        if (promptData.isPro !== undefined) {
          promptData.isPro = promptData.isPro.toString().toUpperCase() === "TRUE";
        } else {
          promptData.isPro = false;
        }
        
        // Process keywords
        if (promptData.keywords) {
          promptData.keywords = promptData.keywords
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean);
        } else {
          promptData.keywords = [];
        }
        
        // Skip rows with empty ID (for new prompts) or validate ID exists (for updates)
        const isUpdate = promptData.id && promptData.id.trim() !== "";
        
        if (isUpdate) {
          // Check if prompt exists
          const existingPrompt = await prisma.prompt.findUnique({
            where: { id: promptData.id },
          });
          
          if (!existingPrompt) {
            results.errors.push({
              row: rowIndex,
              message: `Prompt with ID ${promptData.id} not found`
            });
            continue;
          }
        } else {
          // Remove id field for new prompts
          delete promptData.id;
        }
        
        // Validate prompt data
        const validationResult = promptSchema.safeParse(promptData);
        
        if (!validationResult.success) {
          const errors = validationResult.error.format();
          const errorMessages = Object.entries(errors)
            .filter(([key, value]) => key !== "_errors" && value._errors.length > 0)
            .map(([key, value]) => `${key}: ${value._errors.join(", ")}`)
            .join("; ");
          
          results.errors.push({
            row: rowIndex,
            message: errorMessages
          });
          continue;
        }
        
        // Create or update prompt
        if (isUpdate) {
          // Update existing prompt
          await prisma.prompt.update({
            where: { id: promptData.id },
            data: {
              titleEn: promptData.titleEn,
              titleAr: promptData.titleAr,
              descriptionEn: promptData.descriptionEn || null,
              descriptionAr: promptData.descriptionAr || null,
              instructionEn: promptData.instructionEn || null,
              instructionAr: promptData.instructionAr || null,
              promptTextEn: promptData.promptTextEn,
              promptTextAr: promptData.promptTextAr,
              isPro: promptData.isPro,
              // Don't update categories, keywords, tools here - would need separate handling
            },
          });
        } else {
          // Create new prompt
          const newPrompt = await prisma.prompt.create({
            data: {
              titleEn: promptData.titleEn,
              titleAr: promptData.titleAr,
              descriptionEn: promptData.descriptionEn || null,
              descriptionAr: promptData.descriptionAr || null,
              instructionEn: promptData.instructionEn || null,
              instructionAr: promptData.instructionAr || null,
              promptTextEn: promptData.promptTextEn,
              promptTextAr: promptData.promptTextAr,
              isPro: promptData.isPro,
              copyCount: 0,
              initialCopyCount: 0,
            },
          });
          
          // Handle category and subcategory if provided
          if (promptData.categoryId) {
            await prisma.promptCategory.create({
              data: {
                promptId: newPrompt.id,
                categoryId: promptData.categoryId,
                subcategoryId: promptData.subcategoryId || null,
              },
            });
          }
          
          // Handle keywords if provided
          if (promptData.keywords && promptData.keywords.length > 0) {
            await Promise.all(
              promptData.keywords.map((keyword: string) =>
                prisma.promptKeyword.create({
                  data: {
                    promptId: newPrompt.id,
                    keyword,
                  },
                })
              )
            );
          }
        }
        
        results.imported++;
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        results.errors.push({
          row: i + 2,
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing prompts:", error);
    return NextResponse.json(
      { error: "Failed to import prompts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV row, handling quoted values
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Check if this is an escaped quote (double quote)
      if (i + 1 < row.length && row[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}
