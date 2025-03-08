import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma/client"
import { PromptCard } from "@/components/prompts/prompt-card"
import { Category, Tool } from "@/types/prompts"
import { PlusCircle, Bookmark } from "lucide-react"
import { CreateCatalogButton } from "@/components/catalogs/create-catalog-button"
import { CatalogList } from "@/components/catalogs/catalog-list"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MyPrompts")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function MyPromptsPage({
  params: { locale = "en" }
}: {
  params: { locale: string }
}) {
  const t = await getTranslations("MyPrompts")
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
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
  )
}
