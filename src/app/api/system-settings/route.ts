import { NextRequest, NextResponse } from "next/server";
import { getSystemSetting } from "@/lib/settings";

/**
 * GET handler to retrieve a system setting by key
 * This endpoint is public and can be accessed by client components
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: "Missing key parameter" },
        { status: 400 }
      );
    }
    
    const value = await getSystemSetting(key);
    
    return NextResponse.json({ key, value });
  } catch (error) {
    console.error("Error fetching system setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch system setting" },
      { status: 500 }
    );
  }
}
