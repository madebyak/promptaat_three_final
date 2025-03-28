import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { updateSystemSetting, getSystemSetting } from "@/lib/settings";

/**
 * GET handler to retrieve settings for the CMS
 * This endpoint is protected and can only be accessed by admin users
 */
export async function GET() {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch settings from database
    const showProToAllSetting = await getSystemSetting("showProToAll");

    return NextResponse.json({
      showProToAll: showProToAllSetting,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * POST handler to update settings
 * This endpoint is protected and can only be accessed by admin users
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get settings from request body
    const data = await request.json();
    const { showProToAll } = data;

    // Validate input
    if (typeof showProToAll !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid input: showProToAll must be a boolean" },
        { status: 400 }
      );
    }

    // Update showProToAll setting
    const success = await updateSystemSetting(
      "showProToAll",
      String(showProToAll),
      "When enabled, all users (including unsubscribed users) will see the full content of PRO prompts"
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
