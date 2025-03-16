import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Only allow in development or with admin session
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email?.endsWith("@promptaat.com") || false;
    
    if (process.env.NODE_ENV !== "development" && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    
    // Check if critical environment variables exist (without returning their values)
    const configStatus = {
      stripe: {
        publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secretKey: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        priceIds: {
          proMonthly: {
            nextPublic: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
            server: !!process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
            value: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY?.substring(0, 8) + "..." || "not-set"
          },
          proQuarterly: {
            nextPublic: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY,
            server: !!process.env.STRIPE_PRICE_ID_PRO_QUARTERLY,
            value: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY?.substring(0, 8) + "..." || "not-set"
          },
          proAnnual: {
            nextPublic: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL,
            server: !!process.env.STRIPE_PRICE_ID_PRO_ANNUAL,
            value: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL?.substring(0, 8) + "..." || "not-set"
          }
        }
      },
      nextAuth: {
        secret: !!process.env.NEXTAUTH_SECRET,
        url: !!process.env.NEXTAUTH_URL,
        publicUrl: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL
      },
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL || "not-set",
        nodeEnv: process.env.NODE_ENV || "not-set" 
      }
    };
    
    return NextResponse.json(configStatus);
  } catch (error) {
    console.error("Config debug error:", error);
    return NextResponse.json(
      { error: "Failed to check configuration" },
      { status: 500 }
    );
  }
}
