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

/**
 * Specifically verifies if a user can access a Pro prompt's full content
 * If they can't, this function will properly mask the content
 * @param prompt The prompt object with isPro field and prompt text 
 * @param userId Optional user ID to check subscription status
 * @returns Modified prompt with masked content if needed
 */
export async function verifyProPromptAccess<T extends { isPro: boolean; promptText?: string; promptTextEn?: string; promptTextAr?: string }>(
  prompt: T,
  userId?: string
): Promise<T> {
  // If the prompt is not marked as Pro, return it unmodified
  if (!prompt.isPro) {
    return prompt;
  }

  // If there's no user ID, or user doesn't have subscription, mask the prompt text
  if (!userId) {
    return maskPromptContent(prompt);
  }

  // Check if user has an active subscription
  const hasSubscription = await isUserSubscribed(userId);
  
  // If user has subscription, return the full prompt
  if (hasSubscription) {
    return prompt;
  }
  
  // Otherwise, mask the prompt text
  return maskPromptContent(prompt);
}

/**
 * Helper function to mask prompt content for non-subscribers
 * @param prompt Prompt object to mask
 * @returns Prompt with masked content
 */
function maskPromptContent<T extends { promptText?: string; promptTextEn?: string; promptTextAr?: string }>(
  prompt: T
): T {
  const maskedPrompt = { ...prompt };
  
  // Get the first 100 characters of the prompt text if it exists
  if (maskedPrompt.promptText) {
    const previewText = maskedPrompt.promptText.substring(0, 100);
    maskedPrompt.promptText = `${previewText}... [Pro content - Subscribe to view full prompt]`;
  }
  
  // Handle multilingual content
  if (maskedPrompt.promptTextEn) {
    const previewText = maskedPrompt.promptTextEn.substring(0, 100);
    maskedPrompt.promptTextEn = `${previewText}... [Pro content - Subscribe to view full prompt]`;
  }
  
  if (maskedPrompt.promptTextAr) {
    const previewText = maskedPrompt.promptTextAr.substring(0, 100);
    maskedPrompt.promptTextAr = `${previewText}... [محتوى احترافي - اشترك لعرض المطالبة الكاملة]`;
  }
  
  return maskedPrompt;
}
