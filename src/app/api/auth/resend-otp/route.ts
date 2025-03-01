import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateOTP, sendOTPEmail } from "@/lib/auth/otp"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
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

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP
    await prisma.otpVerification.upsert({
      where: {
        userId: user.id,
      },
      update: {
        code: otp,
        expiresAt,
      },
      create: {
        userId: user.id,
        code: otp,
        expiresAt,
      },
    })

    // Send OTP email
    await sendOTPEmail(user.email, otp)

    return NextResponse.json({
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: "Error sending OTP",
      },
      { status: 500 }
    )
  }
}
