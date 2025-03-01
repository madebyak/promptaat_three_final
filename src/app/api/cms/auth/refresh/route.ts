import { NextRequest, NextResponse } from "next/server";
import { refreshAccessTokenServerSide } from "@/lib/cms/auth/admin-auth";

export async function POST(request: NextRequest) {
  try {
    // Refresh access token
    const result = await refreshAccessTokenServerSide(request);
    
    if (!result) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true,
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          firstName: result.admin.firstName,
          lastName: result.admin.lastName,
          role: result.admin.role,
        }
      },
      { status: 200 }
    );
    
    // Set new access token
    response.cookies.set({
      name: "admin_token",
      value: result.token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });
    
    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
