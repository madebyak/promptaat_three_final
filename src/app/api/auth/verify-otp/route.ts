import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateToken } from "@/lib/auth/token"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, otp } = body

    // Find user and their OTP
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        otpVerification: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      )
    }

    if (!user.otpVerification || !user.otpVerification.code) {
      return NextResponse.json(
        {
          error: "No OTP found",
        },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (user.otpVerification.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "OTP has expired",
        },
        { status: 400 }
      )
    }

    // Verify OTP
    if (user.otpVerification.code !== otp) {
      return NextResponse.json(
        {
          error: "Invalid OTP",
        },
        { status: 400 }
      )
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        otpVerification: {
          delete: true,
        },
      },
    })

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })

    // Set JWT token in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: "Error verifying OTP",
      },
      { status: 500 }
    )
  }
}
