import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/options"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user verification status
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailVerified: true,
        id: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      verified: user.emailVerified ? true : false,
      email: user.email,
    })
  } catch (error) {
    console.error("Verification status error:", error)
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    )
  }
}
