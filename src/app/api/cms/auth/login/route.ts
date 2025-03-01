import { NextRequest, NextResponse } from "next/server";
import { 
  encrypt, 
  generateRefreshToken, 
  loginSchema, 
  setAuthCookies, 
  validateAdminCredentials 
} from "@/lib/cms/auth/admin-auth";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // Validate admin credentials
    const admin = await validateAdminCredentials(
      validatedData.email,
      validatedData.password
    );
    
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = await encrypt({ 
      adminId: admin.id,
      role: admin.role,
    });
    
    // Generate refresh token
    const refreshToken = await generateRefreshToken(admin.id);
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
        }
      },
      { status: 200 }
    );
    
    // Set auth cookies
    return setAuthCookies(response, token, refreshToken);
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
