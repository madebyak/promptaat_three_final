import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // For temporary debugging, provide limited information without strict auth check
    // TODO: Restore proper authorization after debugging is complete
    const session = await getServerSession(authOptions);
    
    // Basic configuration status without sensitive values
    const configStatus = {
      auth: {
        hasSession: !!session,
        userEmail: session?.user?.email ? `${session.user.email.substring(0, 3)}...` : null,
      },
      env: process.env.NODE_ENV || "unknown",
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
        baseUrl: process.env.NEXTAUTH_URL || "not-set",
        nodeEnv: process.env.NODE_ENV || "not-set" 
      }
    };
    
    return NextResponse.json(configStatus);
  } catch (error) {
    console.error("Config debug error:", error);
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : { message: String(error) };
      
    return NextResponse.json(
      { 
        error: "Failed to check configuration",
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
