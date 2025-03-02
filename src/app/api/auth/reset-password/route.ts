import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/lib/crypto";

// Simple password validation
function validatePassword(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  const isValid = 
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber;
  
  let message = "";
  
  if (!isValid) {
    message = "Password must be at least 8 characters and include uppercase, lowercase, and numbers.";
  }
  
  return { isValid, message };
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "password_requirements",
          message: validation.message
        },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "invalid_token",
          message: "Invalid or expired reset token"
        },
        { status: 400 }
      );
    }

    // Hash new password using Web Crypto API
    const hashedPassword = await hashPassword(password);

    // Update user's password and clear reset token
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        error: "reset_failed",
        message: "Error processing request"
      },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token validity
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { 
          error: "missing_token",
          message: "Reset token is required" 
        },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: "invalid_token",
          message: "Invalid or expired reset token" 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token is valid",
      email: user.email
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { 
        error: "verification_failed",
        message: "Error verifying token" 
      },
      { status: 500 }
    );
  }
}
