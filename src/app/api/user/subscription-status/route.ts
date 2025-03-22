import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // If there's no session, the user is not authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { isSubscribed: false, message: "User not authenticated" },
        { status: 401 }
      );
    }
    
    // Check if the user has an active subscription
    const hasSubscription = await isUserSubscribed(session.user.id);
    
    return NextResponse.json({
      isSubscribed: hasSubscription,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { isSubscribed: false, error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
