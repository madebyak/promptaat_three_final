import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { prisma } from "@/lib/prisma/client"
import { PromptCard } from "@/components/prompts/prompt-card"
import { Category, Tool } from "@/types/prompts"
import { PlusCircle, Bookmark } from "lucide-react"
import { CreateCatalogButton } from "@/components/catalogs/create-catalog-button"
import { CatalogList } from "@/components/catalogs/catalog-list"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await getTranslations("MyPrompts");
    return {
      title: t("title"),
      description: t("description"),
    };
  } catch (err) {
    console.error('[METADATA ERROR]', err);
    return {
      title: "My Prompts",
      description: "Manage your prompts and catalogs",
    };
  }
}

// Add debugging function to log information safely
function debugLog(message: string, data?: unknown) {
  try {
    console.log(`[MY-PROMPTS DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  } catch {
    // Ignore stringification errors and just log the message
    console.log(`[MY-PROMPTS DEBUG] ${message} (Data could not be stringified)`);
  }
}

// Create a fallback translation function that won't throw errors
const createFallbackTranslations = () => {
  const fallbacks = {
    "title": "My Prompts",
    "description": "Manage your prompts and catalogs",
    "myPrompts": "My Prompts",
    "catalogs": "Catalogs",
    "createPrompt": "Create Prompt",
    "noPrompts": "You don't have any prompts yet",
    "createYourFirst": "Create your first prompt",
    "noCatalogs": "You don't have any catalogs yet",
    "createCatalog": "Create Catalog",
    "errorTitle": "Error Loading Prompts",
    "errorDescription": "There was a problem loading your prompts",
    "errorAlert": "Error",
    "errorMessage": "We encountered an error retrieving your prompts. Please try refreshing the page."
  };
  
  return (key: string, options?: { defaultValue?: string }) => {
    return options?.defaultValue || fallbacks[key as keyof typeof fallbacks] || key;
  };
};

export default async function MyPromptsPage({
  params: { locale = "en" }
}: {
  params: { locale: string }
}) {
  try {
    debugLog('Rendering my-prompts page, locale:', locale);
    
    // Get translations
    let t;
    try {
      t = await getTranslations("MyPrompts");
      debugLog('Translations loaded successfully');
    } catch (err) {
      debugLog('Error getting translations, using fallbacks:', err);
      // Use fallback translations instead of throwing an error
      t = createFallbackTranslations();
    }
    
    // Get session with error handling
    debugLog('Getting server session');
    const session = await getServerSession(authOptions);
    debugLog('Session retrieved', session);
    
    if (!session?.user) {
      debugLog('No user in session, redirecting to login');
      redirect(`/${locale}/auth/login`);
    }

  // Fetch user's bookmarked prompts
  const bookmarkedPrompts = await prisma.prompt.findMany({
    where: {
      bookmarks: {
        some: {
          userId: session.user.id,
        },
      },
      deletedAt: null,
    },
    include: {
      categories: {
        include: {
          category: true,
          subcategory: true,
        }
      },
      tools: {
        include: {
          tool: true,
        }
      },
    },
    orderBy: {
      createdAt: "desc"
    },
  });

  // Fetch user's catalogs with prompt count
  const catalogs = await prisma.catalog.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          prompts: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
  });

  debugLog('Formatting bookmarked prompts', { count: bookmarkedPrompts.length });
  // Format the bookmarked prompts for the PromptCard component
  const formattedBookmarkedPrompts = bookmarkedPrompts.map(prompt => {
    const categories: Category[] = prompt.categories.map(pc => ({
      id: pc.category.id,
      name: locale === 'ar' ? pc.category.nameAr : pc.category.nameEn,
      iconName: pc.category.iconName,
      subcategory: pc.subcategory ? {
        id: pc.subcategory.id,
        name: locale === 'ar' ? pc.subcategory.nameAr : pc.subcategory.nameEn,
        iconName: pc.subcategory.iconName,
      } : undefined
    }));

    const tools: Tool[] = prompt.tools.map(pt => ({
      id: pt.tool.id,
      name: pt.tool.name,
      iconUrl: pt.tool.iconUrl || undefined
    }));

    return {
      id: prompt.id,
      title: locale === 'ar' ? prompt.titleAr : prompt.titleEn,
      preview: locale === 'ar' ? prompt.promptTextAr : prompt.promptTextEn,
      isPro: prompt.isPro,
      copyCount: prompt.copyCount,
      categories,
      tools,
      isBookmarked: true,
    };
  });

  // We don't need to fetch catalog prompts here anymore since we'll load them on the catalog detail page

  const isRTL = locale === 'ar';

  debugLog('Rendering UI components');
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="bookmarks">
            <Bookmark className="h-4 w-4 mr-2" />
            {t("bookmarks", { defaultValue: "Bookmarks" })}
          </TabsTrigger>
          <TabsTrigger value="catalogs">
            {t("catalogs", { defaultValue: "Catalogs" })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks">
          {formattedBookmarkedPrompts.length === 0 ? (
            <Card className="p-6">
              <CardContent className="pt-6 text-center">
                <p className="text-lg text-muted-foreground mb-4">{t("noBookmarks", { defaultValue: "You haven't bookmarked any prompts yet" })}</p>
                <Link href="/prompts">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("browsePrompts", { defaultValue: "Browse Prompts" })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {formattedBookmarkedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  id={prompt.id}
                  title={prompt.title}
                  preview={prompt.preview}
                  isPro={prompt.isPro}
                  copyCount={prompt.copyCount}
                  categories={prompt.categories}
                  tools={prompt.tools}
                  isRTL={isRTL}
                  locale={locale}
                  isBookmarked={prompt.isBookmarked}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="catalogs">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t("myCatalogs", { defaultValue: "My Catalogs" })}</h2>
            <CreateCatalogButton />
          </div>
          
          <CatalogList catalogs={catalogs} />
        </TabsContent>
      </Tabs>
    </div>
  );
  } catch (err) {
    // Log the error
    console.error('[MY-PROMPTS ERROR]', err);
    
    // Return an error UI instead of crashing
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardHeader>
            <CardTitle>Error Loading Prompts</CardTitle>
            <CardDescription>
              There was a problem loading your prompts information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                We encountered an error retrieving your prompts data. Please try refreshing the page.
                <div className="mt-2">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {err instanceof Error ? err.message : 'Unknown error'}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Link href="/">
                <Button variant="outline">Go to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
