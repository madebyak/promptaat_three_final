import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";

/**
 * Middleware utility that checks if a user has an active subscription
 * @param handler The handler function to execute if the user is subscribed
 * @param options Configuration options
 * @returns A response or the result of the handler function
 */
export async function withSubscriptionGuard<T>(
  handler: () => Promise<T>,
  options: {
    errorMessage?: string;
    errorStatus?: number;
    allowUnauthorized?: boolean;
  } = {}
): Promise<T | NextResponse> {
  // Set default options
  const {
    errorMessage = "Pro subscription required to access this content",
    errorStatus = 403,
    allowUnauthorized = false,
  } = options;

  // Get user session
  const session = await getServerSession(authOptions);
  
  // If no session and unauthorized users are not allowed
  if (!session?.user && !allowUnauthorized) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // If user is authenticated, check subscription
  if (session?.user?.id) {
    const hasSubscription = await isUserSubscribed(session.user.id);
    
    // If user has no subscription, return error
    if (!hasSubscription) {
      return NextResponse.json(
        { error: errorMessage },
        { status: errorStatus }
      );
    }
  } else if (!allowUnauthorized) {
    // This should not happen due to the earlier check, but added as a safeguard
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // User has a subscription (or is allowed to proceed without one), execute handler
  return await handler();
}

/**
 * Checks if a request is for premium content and if the user has access
 * @param req NextRequest object
 * @param isPro Boolean indicating if content is premium
 * @returns Boolean indicating if content is accessible
 */
export async function verifyProContentAccess(
  req: NextRequest,
  isPro: boolean
): Promise<{ isAuthorized: boolean; userId?: string }> {
  // If content is not premium, always allow access
  if (!isPro) {
    return { isAuthorized: true };
  }

  // Get user session
  const session = await getServerSession(authOptions);
  
  // If no session, user cannot access premium content
  if (!session?.user?.id) {
    return { isAuthorized: false };
  }

  // Check if user has an active subscription
  const hasSubscription = await isUserSubscribed(session.user.id);
  
  return { 
    isAuthorized: hasSubscription,
    userId: session.user.id
  };
}

/**
 * Route handler wrapper to protect premium content
 * Use this for API routes that need to check if content is pro and user has access
 */
export async function handleProContentRequest(
  req: NextRequest,
  isPro: boolean,
  handleAuthorized: () => Promise<NextResponse>,
  options: {
    errorMessage?: string;
    allowPreview?: boolean;
  } = {}
): Promise<NextResponse> {
  const {
    errorMessage = "Pro subscription required to access this content",
    allowPreview = false
  } = options;

  // Check if is a preview request (if we allow previews)
  const url = new URL(req.url);
  const isPreviewRequest = allowPreview && url.searchParams.get('preview') === 'true';

  // If content is premium and not a preview request, verify access
  if (isPro && !isPreviewRequest) {
    const { isAuthorized } = await verifyProContentAccess(req, isPro);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: errorMessage,
          isPro: true,
          requiresSubscription: true
        },
        { status: 403 }
      );
    }
  }

  // User is authorized or content is not premium, proceed with handler
  return await handleAuthorized();
}
