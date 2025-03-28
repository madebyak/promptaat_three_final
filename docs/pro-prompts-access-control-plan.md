# PRO Prompts Access Control Implementation Plan

## Table of Contents
1. [Current System Analysis](#current-system-analysis)
2. [Requirements](#requirements)
3. [Proposed Solution](#proposed-solution)
4. [Implementation Plan](#implementation-plan)
5. [Database Changes](#database-changes)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Testing Plan](#testing-plan)

## Current System Analysis

### PRO vs Basic Prompts Flow

1. **Content Access Control**:
   - PRO prompts are marked with `isPro: true` in the database
   - The `ProPromptContent` component conditionally renders content based on:
     - Whether the prompt is marked as PRO
     - Whether the user has an active subscription

2. **Subscription Verification**:
   - `isUserSubscribed()` function checks if a user has an active subscription
   - Subscription status is verified through various status checks (active, incomplete, trialing, etc.)
   - The system uses case-insensitive matching to handle different status formats

3. **Copy Functionality**:
   - Copy functionality in `prompt-modal.tsx` checks if a prompt is PRO before allowing copying
   - The API route `/api/prompts/[id]/copy` uses `withSubscriptionGuard` to protect PRO content
   - Non-PRO prompts can be copied by anyone who can view them

4. **Authentication Flow**:
   - Currently, unauthenticated users can view basic prompts without logging in
   - For PRO prompts, unauthenticated users see a masked preview with an upgrade button
   - Bookmark functionality already requires authentication

### Unregistered/Unsubscribed User Flow

1. **Unregistered Users**:
   - Can browse and view basic prompts
   - Can copy basic prompts without logging in
   - See a preview of PRO prompts with a subscription CTA

2. **Unsubscribed (Basic) Users**:
   - Can browse and view basic prompts
   - Can copy basic prompts
   - See a preview of PRO prompts with a subscription CTA

3. **Subscribed (PRO) Users**:
   - Can browse and view all prompts (basic and PRO)
   - Can copy all prompts
   - Have full access to all features

## Requirements

1. **Require Login for Copying Any Prompt**:
   - Users must be logged in to copy any prompt, regardless of whether it's a basic or PRO prompt
   - Unauthenticated users should be redirected to the login page when attempting to copy a prompt

2. **Toggle for Showing/Hiding PRO Prompts**:
   - Add a system-wide setting in the CMS to control the visibility of PRO prompts
   - When enabled, all users (including unsubscribed users) should see the full content of PRO prompts
   - When disabled, only subscribers should see the full content of PRO prompts

## Proposed Solution

### 1. Require Login for Copying Any Prompt

We need to modify both the frontend and backend to enforce this requirement:

#### Frontend Changes:

1. **Modify `handleCopy` in `prompt-modal.tsx`**:
   - Add a session check before allowing copying
   - Redirect to login page if no session exists

2. **Update Copy Button UI**:
   - Add visual indication that login is required for copying

#### Backend Changes:

1. **Modify `/api/prompts/[id]/copy/route.ts`**:
   - Update the route to require authentication for all prompts, not just PRO prompts
   - Return appropriate error responses for unauthenticated users

### 2. Toggle for Showing/Hiding PRO Prompts to Basic Users

This requires a system-wide setting that can be toggled in the CMS:

#### Database Changes:

1. **Create System Settings Table**:
   - Add a new table to store global system settings
   - Include a boolean field for the PRO content visibility toggle

2. **API for Managing Settings**:
   - Create endpoints to get and update system settings

#### CMS UI Changes:

1. **Enhance System Settings Tab**:
   - Add a toggle switch for "Show PRO prompts to all users"
   - Add appropriate descriptions and UI elements

#### Content Access Logic Changes:

1. **Modify `ProPromptContent` Component**:
   - Update the rendering logic to check the system setting
   - If the setting is enabled, show full content regardless of subscription status

2. **Update Subscription Guard**:
   - Modify `withSubscriptionGuard` to check the system setting
   - Allow access to PRO content when the setting is enabled

## Implementation Plan

### Phase 1: Database and API Setup

1. Create a system settings table in the database **(COMPLETED - Using existing AdminSetting model)**
2. Create API endpoints for managing system settings **(COMPLETED)**
3. Implement the settings retrieval logic **(COMPLETED)**

### Phase 2: CMS Settings UI

1. Enhance the System Settings tab in the CMS **(COMPLETED)**
2. Add the toggle for PRO content visibility **(COMPLETED)**
3. Connect the UI to the API endpoints **(COMPLETED)**

### Phase 3: Require Login for Copying

1. Update the frontend copy functionality **(COMPLETED)**
2. Modify the backend copy API route **(COMPLETED)**
3. Add appropriate UI indicators and redirects **(COMPLETED)**

### Phase 4: PRO Content Access Control

1. Update the `ProPromptContent` component **(COMPLETED)**
2. Modify the subscription guard logic **(COMPLETED)**
3. Ensure consistent behavior across the application **(COMPLETED)**

### Phase 5: Testing and Validation

1. Test all user flows (unregistered, basic, PRO)
2. Verify the settings toggle works correctly
3. Ensure backward compatibility

## Database Changes

### System Settings Table

```prisma
// prisma/schema.prisma (add this model)
model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migration Script

```sql
-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- Insert default settings
INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
VALUES (
    'cuid-generated-id', 
    'showProToAll', 
    'false', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. System Settings API

```typescript
// src/app/api/cms/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";

// GET handler to retrieve settings
export async function GET() {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch settings from database
    const showProToAllSetting = await prisma.systemSetting.findUnique({
      where: { key: "showProToAll" },
    });

    return NextResponse.json({
      showProToAll: showProToAllSetting?.value || "false",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST handler to update settings
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get settings from request body
    const data = await request.json();
    const { showProToAll } = data;

    // Update showProToAll setting
    await prisma.systemSetting.upsert({
      where: { key: "showProToAll" },
      update: { value: String(showProToAll) },
      create: { key: "showProToAll", value: String(showProToAll) },
    });

    return NextResponse.json({
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
```

### 2. Public System Settings API

```typescript
// src/app/api/system-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSystemSetting } from "@/lib/settings";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: "Missing key parameter" },
        { status: 400 }
      );
    }
    
    const value = await getSystemSetting(key);
    
    return NextResponse.json({ key, value });
  } catch (error) {
    console.error("Error fetching system setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch system setting" },
      { status: 500 }
    );
  }
}
```

### 3. Updated Copy API

```typescript
// src/app/api/prompts/[id]/copy/route.ts
// Update the POST handler

export async function POST(
  request: NextRequest,
) {
  try {
    // Extract ID from URL path
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 2]; // Get the ID segment before 'copy'

    // Get the prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      select: { id: true, isPro: true }
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      );
    }

    // Get user session - ALWAYS require authentication for copying
    const session = await getServerSession(authOptions);
    
    // If no session, return authentication required error
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to copy prompts", requiresAuth: true },
        { status: 401 }
      );
    }

    // If it's a Pro prompt, use the subscription guard to protect it
    if (prompt.isPro) {
      // Check if PRO content should be shown to all
      const showProToAll = await shouldShowProToAll();
      
      if (!showProToAll) {
        return await withSubscriptionGuard(
          async () => {
            // User has a subscription, proceed with copying
            return await performCopyOperation(id);
          },
          {
            errorMessage: "You need a Pro subscription to copy this premium prompt",
            errorStatus: 403,
            allowUnauthorized: false
          }
        );
      }
    }
    
    // If it's not a Pro prompt or showProToAll is true, proceed with copying
    return await performCopyOperation(id);
  } catch (error) {
    console.error("Copy prompt error:", error);
    return NextResponse.json(
      { error: "Failed to copy prompt" },
      { status: 500 }
    );
  }
}
```

## Frontend Components

### 1. System Settings Utility

```typescript
// src/lib/settings.ts
import { prisma } from "@/lib/prisma/client";

// Cache for system settings to reduce database queries
let settingsCache: Record<string, string> = {};
let cacheExpiry = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get a system setting value
 * @param key The setting key
 * @param defaultValue Default value if setting not found
 * @returns The setting value
 */
export async function getSystemSetting(key: string, defaultValue: string = "false"): Promise<string> {
  const now = Date.now();
  
  // If cache is expired, refresh it
  if (now > cacheExpiry) {
    try {
      const settings = await prisma.systemSetting.findMany();
      settingsCache = {};
      
      // Populate cache with settings
      settings.forEach(setting => {
        settingsCache[setting.key] = setting.value;
      });
      
      // Set cache expiry
      cacheExpiry = now + CACHE_TTL;
    } catch (error) {
      console.error("Error fetching system settings:", error);
      return defaultValue;
    }
  }
  
  // Return from cache or default
  return settingsCache[key] || defaultValue;
}

/**
 * Check if PRO content should be shown to all users
 * @returns Boolean indicating if PRO content should be shown to all
 */
export async function shouldShowProToAll(): Promise<boolean> {
  const value = await getSystemSetting("showProToAll", "false");
  return value === "true";
}
```

### 2. System Settings Component

```tsx
// src/components/cms/settings/system-settings.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";

export function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showProToAll: false,
  });

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/cms/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            showProToAll: data.showProToAll === "true",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load system settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/cms/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          showProToAll: settings.showProToAll,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "System settings updated successfully",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Access Settings</CardTitle>
        <CardDescription>
          Configure how users access content on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <div>
            <Label htmlFor="show-pro-toggle" className="font-medium">
              Show PRO prompts to all users
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              When enabled, all users (including unsubscribed users) will see the full content of PRO prompts.
              When disabled, only subscribers will see the full content of PRO prompts.
            </p>
          </div>
          <Switch
            id="show-pro-toggle"
            checked={settings.showProToAll}
            onCheckedChange={(checked) => setSettings({ ...settings, showProToAll: checked })}
          />
        </div>

        <div className="border-t pt-4">
          <Button onClick={saveSettings} disabled={saving}>
            {saving && <Spinner className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Updated Settings Management Component

```tsx
// Update src/components/cms/settings/settings-management.tsx
// Import the SystemSettings component
import { SystemSettings } from "./system-settings";

// Replace the system tab content with our new component
<TabsContent value="system" className="space-y-4">
  <SystemSettings />
</TabsContent>
```

### 4. Updated ProPromptContent Component

```tsx
// src/components/prompts/pro-prompt-content.tsx
// Update the component to check the system setting

"use client";

import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Crown, Sparkles } from "lucide-react";
import Image from "next/image";
import { UpgradeButton } from "@/components/common/upgrade-button";
import { useTranslations } from "next-intl";

interface ProPromptContentProps {
  isPro: boolean;
  isUserSubscribed: boolean;
  children: ReactNode;
  locale?: string;
  className?: string;
}

export function ProPromptContent({
  isPro,
  isUserSubscribed,
  children,
  locale = "en",
  className,
}: ProPromptContentProps) {
  const t = useTranslations('ProContent');
  const [showProToAll, setShowProToAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the system setting
  useEffect(() => {
    async function fetchSetting() {
      try {
        const response = await fetch('/api/system-settings?key=showProToAll');
        if (response.ok) {
          const data = await response.json();
          setShowProToAll(data.value === 'true');
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSetting();
  }, []);
  
  // Show loading state while fetching setting
  if (isLoading) {
    return <div className={className}>{children}</div>;
  }
  
  // If the prompt is not Pro, the user is subscribed, or the system setting is enabled, show the content
  if (!isPro || isUserSubscribed || showProToAll) {
    return <div className={className}>{children}</div>;
  }

  // For Pro prompts where user is not subscribed and system setting is disabled, show premium overlay
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Rest of the component remains the same */}
    </div>
  );
}
```

### 5. Updated Copy Functionality in Prompt Modal

```tsx
// src/components/prompts/prompt-modal.tsx
// Update the handleCopy function

const handleCopy = useCallback(async () => {
  if (!prompt) return
  
  // Check if user is logged in
  if (!session?.user) {
    toast({
      title: t('authenticationRequired'),
      description: t('signInToCopy'),
      variant: "destructive",
    })
    
    // Redirect to login page
    router.push(`/${locale}/auth/login`)
    return
  }
  
  // Check if this is a Pro prompt and user is not subscribed
  if (prompt.isPro && userSubscriptionStatus === false) {
    // Check if PRO content is shown to all
    try {
      const response = await fetch('/api/system-settings?key=showProToAll');
      if (response.ok) {
        const data = await response.json();
        const showProToAll = data.value === 'true';
        
        // If PRO content is not shown to all, show subscription required message
        if (!showProToAll) {
          toast({
            title: t('proContent'),
            description: t('proSubscriptionRequired'),
          })
          return
        }
      }
    } catch (error) {
      console.error('Error checking system settings:', error);
    }
  }
  
  try {
    // Copy to clipboard
    await navigator.clipboard.writeText(prompt.promptText)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    
    // Update copy count in the database
    // Rest of the function remains the same
  } catch (err) {
    // Error handling remains the same
  }
}, [prompt, promptId, toast, userSubscriptionStatus, t, session, router, locale])
```

## Testing Plan

### 1. Unregistered Users

- **Test Case 1.1**: Verify unregistered users can view basic prompts
  - Expected: Basic prompts are fully visible
  
- **Test Case 1.2**: Verify unregistered users are redirected to login when trying to copy any prompt
  - Expected: Clicking copy button redirects to login page
  
- **Test Case 1.3**: Verify unregistered users see a preview of PRO prompts when the setting is disabled
  - Expected: PRO prompts show a preview with upgrade button
  
- **Test Case 1.4**: Verify unregistered users see full PRO content when the setting is enabled
  - Expected: PRO prompts are fully visible

### 2. Unsubscribed (Basic) Users

- **Test Case 2.1**: Verify basic users can view and copy basic prompts
  - Expected: Basic prompts are fully visible and can be copied
  
- **Test Case 2.2**: Verify basic users see a preview of PRO prompts when the setting is disabled
  - Expected: PRO prompts show a preview with upgrade button
  
- **Test Case 2.3**: Verify basic users see full PRO content when the setting is enabled
  - Expected: PRO prompts are fully visible and can be copied

### 3. Subscribed (PRO) Users

- **Test Case 3.1**: Verify PRO users can view and copy all prompts regardless of the setting
  - Expected: All prompts are fully visible and can be copied

### 4. CMS Settings

- **Test Case 4.1**: Verify the toggle works correctly
  - Expected: Toggling the setting updates the database value
  
- **Test Case 4.2**: Verify the setting is persisted after page refresh
  - Expected: Setting value remains the same after refreshing the page
  
- **Test Case 4.3**: Verify the setting affects content visibility immediately
  - Expected: Changing the setting immediately affects PRO content visibility

### 5. Edge Cases

- **Test Case 5.1**: Verify behavior when system settings API fails
  - Expected: System defaults to not showing PRO content to all
  
- **Test Case 5.2**: Verify behavior when copy API fails
  - Expected: Appropriate error message is shown to the user
  
- **Test Case 5.3**: Verify behavior when user's subscription status is indeterminate
  - Expected: System defaults to not allowing access to PRO content

## Conclusion

This implementation plan provides a comprehensive approach to enhancing the PRO prompts access control in the Promptaat platform. By requiring login for copying prompts and adding a toggle for showing/hiding PRO prompts, we improve both the user experience and the platform's flexibility.

The solution follows best practices:
- Uses a database-backed settings system for persistence
- Implements caching to reduce database queries
- Provides a clean UI for managing settings
- Ensures consistent behavior across the application
- Maintains backward compatibility

This implementation can be extended in the future to include additional access control features as needed.
