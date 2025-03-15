# Promptaat Subscription System: Complete Implementation Plan

## Part 1: Pro User Experience & UI Enhancements

### 1. Pro Badge Implementation

#### 1.1 Navbar Pro Badge
We need to add a visually appealing "Pro" badge next to the user's profile picture in the navbar to indicate their premium status.

```typescript
// src/components/layout/navbar.tsx
// Add this next to the user profile picture
{isUserPro && (
  <div className="flex items-center mr-2">
    <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
      <Crown className="h-3 w-3 mr-1" />
      PRO
    </div>
  </div>
)}
```

#### 1.2 User Menu Pro Badge
Add the Pro badge in the user dropdown menu to reinforce the premium status.

```typescript
// src/components/layout/user-menu.tsx
// Add this in the DropdownMenuLabel section
<DropdownMenuLabel className="font-normal">
  <div className="flex flex-col space-y-1">
    <div className="flex items-center">
      <p className="text-sm font-medium leading-none">{user.name}</p>
      {isUserPro && (
        <div className="ml-2 bg-gradient-to-r from-purple-500 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
          <Crown className="h-3 w-3 mr-1" />
          PRO
        </div>
      )}
    </div>
    <p className="text-xs leading-none text-light-grey">{user.email}</p>
  </div>
</DropdownMenuLabel>
```

#### 1.3 Profile Page Pro Badge
Add the Pro badge on the user's profile page.

```typescript
// src/app/[locale]/profile/page.tsx
// Add this near the user's name
<div className="flex items-center gap-2">
  <h2 className="text-2xl font-bold">{user.name}</h2>
  {isUserPro && (
    <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center">
      <Crown className="h-3 w-3 mr-1" />
      PRO
    </div>
  )}
</div>
```

#### 1.4 My Subscriptions Page Pro Badge
Enhance the subscription page with a more prominent Pro badge.

```typescript
// src/app/[locale]/subscription/page.tsx
// Replace the current Badge component with this enhanced version
<Badge variant={isSubscribed ? "secondary" : "outline"} className={isSubscribed ? "bg-gradient-to-r from-purple-500 to-green-500 text-white border-0" : ""}>
  {isSubscribed ? (
    <div className="flex items-center">
      <Crown className="h-4 w-4 mr-1" />
      PRO
    </div>
  ) : "Inactive"}
</Badge>
```

### 2. Pro Prompt Blur Implementation

#### 2.1 Create a Subscription Utility
First, we need to create a utility function to check if a user is subscribed:

```typescript
// src/lib/subscription.ts
import { prisma } from "@/lib/prisma/client";

export async function isUserSubscribed(userId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    // Find active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: "active",
        currentPeriodEnd: {
          gt: new Date()
        }
      }
    });
    
    return !!subscription;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}
```

#### 2.2 Create a Pro Prompt Wrapper Component
Create a component that will handle the blurring of premium content for non-subscribers:

```typescript
// src/components/prompts/pro-prompt-content.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProPromptContentProps {
  isPro: boolean;
  isUserSubscribed: boolean;
  children: React.ReactNode;
  locale: string;
  className?: string;
}

export function ProPromptContent({
  isPro,
  isUserSubscribed,
  children,
  locale,
  className
}: ProPromptContentProps) {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  
  // If it's not a pro prompt or the user is subscribed, show content normally
  if (!isPro || isUserSubscribed) {
    return <div className={className}>{children}</div>;
  }
  
  // Otherwise, show blurred content with upgrade prompt
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center z-10 bg-background/50">
        <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white p-2 rounded-full mb-4">
          <Crown className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
        <p className="text-sm text-center mb-4 max-w-xs">
          Subscribe to our Pro plan to access this premium prompt
        </p>
        <div className="flex gap-2">
          <Button 
            className="bg-gradient-to-r from-purple-500 to-green-500 text-white"
            asChild
          >
            <Link href={`/${locale}/subscription`}>
              Subscribe Now
            </Link>
          </Button>
        </div>
      </div>
      <div className="blur-md select-none pointer-events-none">
        {children}
      </div>
    </div>
  );
}
```
