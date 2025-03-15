# Promptaat Subscription System: Complete Implementation Plan

## Part 2: Pro Prompt Implementation & Security

### 3. Implementing Pro Prompt Protection

#### 3.1 Update Prompt Card Component
Modify the prompt card component to use the ProPromptContent wrapper:

```typescript
// src/components/prompts/prompt-card.tsx
// Import the new component
import { ProPromptContent } from '@/components/prompts/pro-prompt-content';

// Add isUserSubscribed to props
interface PromptCardProps {
  // ... existing props
  isUserSubscribed: boolean;
}

// Update the component to use ProPromptContent
export function PromptCard({
  // ... existing props
  isUserSubscribed,
}: PromptCardProps) {
  // ... existing code

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        isRTL && "text-right"
      )}
      onClick={() => setIsModalOpen(true)}
    >
      {/* ... existing code */}
      
      {/* Wrap the preview text with ProPromptContent */}
      <ProPromptContent
        isPro={isPro}
        isUserSubscribed={isUserSubscribed}
        locale={locale}
        className="mt-2 line-clamp-3 text-sm text-muted-foreground"
      >
        {preview}
      </ProPromptContent>
      
      {/* ... rest of the component */}
    </Card>
  );
}
```

#### 3.2 Update Prompt Modal Component
Modify the prompt modal to protect premium content:

```typescript
// src/components/prompts/prompt-modal.tsx
// Import the ProPromptContent component
import { ProPromptContent } from '@/components/prompts/pro-prompt-content';

// Add isUserSubscribed to props
interface PromptModalProps {
  // ... existing props
  isUserSubscribed: boolean;
}

export function PromptModal({
  // ... existing props
  isUserSubscribed,
}: PromptModalProps) {
  // ... existing code

  // Update the Prompt Text section
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* ... existing code */}
        
        {/* Prompt Text with protection */}
        <Alert className="mb-6">
          <div className="relative">
            <ProPromptContent
              isPro={prompt?.isPro || false}
              isUserSubscribed={isUserSubscribed}
              locale={locale}
              className="whitespace-pre-wrap font-mono text-sm pr-24"
            >
              <AlertDescription className="whitespace-pre-wrap font-mono text-sm pr-24">
                {prompt?.promptText}
              </AlertDescription>
            </ProPromptContent>
            
            {/* Only show copy button if user has access */}
            {(!prompt?.isPro || isUserSubscribed) && (
              <Button
                className={cn(
                  "absolute top-0 right-0 mt-2 mr-2 transition-all duration-200",
                  isCopied ? "border-accent-green text-accent-green" : "bg-accent-green text-black hover:bg-accent-green/90"
                )}
                variant={isCopied ? "outline" : "secondary"}
                size="sm"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <CheckCircle className="h-3 w-3 mr-2" />
                ) : (
                  <Copy className="h-3 w-3 mr-2" />
                )}
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
        </Alert>
        
        {/* ... rest of the component */}
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Server-Side Protection for Pro Prompts

#### 4.1 Update Prompt API Route
Modify the API route to prevent unauthorized access to Pro prompt content:

```typescript
// src/app/api/prompts/[id]/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authOptions } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;
    const session = await getServerSession(authOptions);
    
    // Get locale from query params
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") || "en";
    
    // Fetch the prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: {
        // ... existing includes
      },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Check if user is subscribed if this is a pro prompt
    let userSubscribed = false;
    if (session?.user?.id) {
      userSubscribed = await isUserSubscribed(session.user.id);
    }
    
    // If it's a pro prompt and user is not subscribed, redact the content
    let promptData = {
      ...prompt,
      // Use locale to determine which fields to return
      title: locale === "ar" ? prompt.titleAr : prompt.titleEn,
      description: locale === "ar" ? prompt.descriptionAr : prompt.descriptionEn,
      instruction: locale === "ar" ? prompt.instructionAr : prompt.instructionEn,
      promptText: locale === "ar" ? prompt.promptTextAr : prompt.promptTextEn,
      // ... other fields
    };
    
    // Redact content for non-subscribers
    if (prompt.isPro && !userSubscribed) {
      promptData = {
        ...promptData,
        // Provide a preview but not the full content
        promptText: "[Premium Content] Subscribe to access this prompt",
        instruction: prompt.instructionEn ? "[Premium Content] Subscribe to access instructions" : null,
      };
    }
    
    return NextResponse.json(promptData);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompt" },
      { status: 500 }
    );
  }
}
```

#### 4.2 Update Copy API Route
Prevent non-subscribers from copying Pro prompts:

```typescript
// src/app/api/prompts/[id]/copy/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { authOptions } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const promptId = params.id;
    const session = await getServerSession(authOptions);
    
    // Fetch the prompt to check if it's a pro prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }
    
    // Check if user is subscribed if this is a pro prompt
    if (prompt.isPro) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required for premium prompts" },
          { status: 401 }
        );
      }
      
      const userSubscribed = await isUserSubscribed(session.user.id);
      if (!userSubscribed) {
        return NextResponse.json(
          { error: "Subscription required for premium prompts" },
          { status: 403 }
        );
      }
    }
    
    // Increment copy count
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        copyCount: { increment: 1 },
      },
    });
    
    return NextResponse.json({ copyCount: updatedPrompt.copyCount });
  } catch (error) {
    console.error("Error updating copy count:", error);
    return NextResponse.json(
      { error: "Failed to update copy count" },
      { status: 500 }
    );
  }
}
```

### 5. Security Against Web Inspector Hacking

#### 5.1 Client-Side Protection
Implement client-side protection against web inspector hacking:

```typescript
// src/components/prompts/pro-prompt-content.tsx
// Add this to the component

// Add a useEffect to detect DevTools opening
useEffect(() => {
  // Function to detect DevTools
  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
      // If DevTools is detected, redirect to subscription page
      if (isPro && !isUserSubscribed) {
        window.location.href = `/${locale}/subscription?source=security`;
      }
    }
  };
  
  // Set up listeners
  if (isPro && !isUserSubscribed) {
    window.addEventListener('resize', detectDevTools);
    
    // Also set up protection against copying text
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('copy', preventCopy);
    
    return () => {
      window.removeEventListener('resize', detectDevTools);
      document.removeEventListener('copy', preventCopy);
    };
  }
}, [isPro, isUserSubscribed, locale]);
```
