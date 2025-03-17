import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Security check - only allow in development or with debug token
  if (process.env.NODE_ENV === "production") {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.DEBUG_ENV_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  // Create safe versions of environment variables (redacting sensitive values)
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "[Set]" : "[Not Set]",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "[Secret Exists]" : "[Not Set]",
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "[Not Set]",
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || "[Not Set]",
    VERCEL_URL: process.env.VERCEL_URL || "[Not Set]",
    
    // Stripe configuration (redacted for security)
    STRIPE_CONFIG: {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      hasPriceIDs: {
        monthly: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
        quarterly: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_QUARTERLY,
        annual: !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_ANNUAL,
      }
    },
    
    // Request information
    REQUEST: {
      host: req.headers.get("host"),
      protocol: req.headers.get("x-forwarded-proto") || "http",
      url: req.url,
    }
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: safeEnv,
  });
}
