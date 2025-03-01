import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    console.log(`[${new Date().toISOString()}] DB Test: Attempting to connect to database...`);
    
    // Test database connection with a simple query
    const categoryCount = await prisma.category.count();
    console.log(`[${new Date().toISOString()}] DB Test: Category count:`, categoryCount);
    
    // Get database schema information
    let databaseSchema = {};
    
    try {
      // Test schema access with raw SQL
      const tableColumns = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'categories'
      `;
      
      databaseSchema = {
        categoryModel: Object.keys(prisma.category),
        categoryFields: Array.isArray(tableColumns) ? tableColumns.map((row: any) => row.column_name) : [],
      };
      
      console.log(`[${new Date().toISOString()}] DB Test: Schema information retrieved successfully`);
    } catch (schemaError) {
      console.error(`[${new Date().toISOString()}] DB Test: Error retrieving schema:`, schemaError);
      databaseSchema = {
        error: "Failed to retrieve schema",
        message: schemaError instanceof Error ? schemaError.message : "Unknown error",
      };
    }
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      categoryCount,
      databaseSchema,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] DB Test Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
