import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/verification";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Invalid email provided" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiry,
      },
    });

    // Send reset email
    await sendPasswordResetEmail({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      token: resetToken
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    
    // Don't expose internal errors to the client
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
