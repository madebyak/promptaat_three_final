import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma/client"
import { PromptCard } from "@/components/prompts/prompt-card"
import { Category, Tool } from "@/types/prompts"
import { PlusCircle, ArrowLeft } from "lucide-react"
import { EditCatalogButton } from "@/components/catalogs/edit-catalog-button"
import { RemoveFromCatalogButton } from "@/components/catalogs/remove-from-catalog-button"

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string }
}): Promise<Metadata> {
  const t = await getTranslations("Catalogs")
  
  try {
    const catalog = await prisma.catalog.findUnique({
      where: {
        id: params.id,
      },
    })
    
    if (!catalog) {
      return {
        title: t("catalogNotFound", { defaultValue: "Catalog Not Found" }),
      }
    }
    
    return {
      title: `${catalog.name} - ${t("catalog", { defaultValue: "Catalog" })}`,
      description: t("catalogDescription", { defaultValue: "View and manage your catalog" }),
    }
  } catch {
    return {
      title: t("catalog", { defaultValue: "Catalog" }),
      description: t("catalogDescription", { defaultValue: "View and manage your catalog" }),
    }
  }
}

export default async function CatalogDetailPage({
  params: { id, locale = "en" }
}: {
  params: { id: string; locale: string }
}) {
  const t = await getTranslations("Catalogs")
  // Use the destructured locale and id parameters
  const defaultLocale = locale || "en"
  const isRTL = defaultLocale === 'ar'
  
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(`/${defaultLocale}/auth/login`)
  }
  
  try {
    // Fetch the catalog and check if it belongs to the current user
    const catalogData = await prisma.catalog.findFirst({
      where: {
        id: id,
        userId: session.user.id,
        deletedAt: null,
      },
    })
    
    // If catalog doesn't exist, return 404
    if (!catalogData) {
      notFound()
    }
    
    // Create a catalog object with the description field
    // Use type assertion to include the description field
    const catalog = catalogData as {
      id: string;
      name: string;
      description?: string;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    }
    
    // Catalog existence already checked above
  
    // Fetch prompts in this catalog
    const catalogPrompts = await prisma.catalogPrompt.findMany({
      where: {
        catalogId: id,
      },
      include: {
        prompt: {
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
          }
        }
      },
    })
    
    // Format prompts for the PromptCard component
    const formattedPrompts = catalogPrompts.map(cp => {
      const prompt = cp.prompt
      const categories: Category[] = prompt.categories.map(pc => ({
        id: pc.category.id,
        name: defaultLocale === 'ar' ? pc.category.nameAr : pc.category.nameEn,
        iconName: pc.category.iconName,
        subcategory: pc.subcategory ? {
          id: pc.subcategory.id,
          name: defaultLocale === 'ar' ? pc.subcategory.nameAr : pc.subcategory.nameEn,
          iconName: pc.subcategory.iconName,
        } : undefined
      }))

      const tools: Tool[] = prompt.tools.map(pt => ({
        id: pt.tool.id,
        name: pt.tool.name,
        iconUrl: pt.tool.iconUrl || undefined
      }))

      return {
        id: prompt.id,
        title: defaultLocale === 'ar' ? prompt.titleAr : prompt.titleEn,
        preview: defaultLocale === 'ar' ? prompt.promptTextAr : prompt.promptTextEn,
        isPro: prompt.isPro,
        copyCount: prompt.copyCount,
        categories,
        tools,
        isBookmarked: true, // Since it's in a catalog, we assume it's bookmarked
        catalogId: id, // Add the catalog ID for the remove button
      }
    })

    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Link href="/my-prompts" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToMyPrompts", { defaultValue: "Back to My Prompts" })}
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{catalog.name}</h1>
              {catalog.description && (
                <p className="text-muted-foreground mt-2">{catalog.description}</p>
              )}
            </div>
            <EditCatalogButton 
              catalogId={catalog.id}
              catalogName={catalog.name}
              catalogDescription={catalog.description || ""}
              translations={{
                editCatalog: t("editCatalog", { defaultValue: "Edit Catalog" }),
                editYourCatalog: t("editYourCatalog", { defaultValue: "Edit your catalog" }),
                name: t("name", { defaultValue: "Name" }),
                description: t("description", { defaultValue: "Description (optional)" }),
                cancel: t("cancel", { defaultValue: "Cancel" }),
                save: t("save", { defaultValue: "Save Changes" }),
              }}
            />
          </div>
        </div>
        
        {formattedPrompts.length === 0 ? (
          <Card className="p-6">
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                {t("emptyCatalog", { defaultValue: "This catalog is empty" })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/prompts">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("browsePrompts", { defaultValue: "Browse Prompts" })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formattedPrompts.map((prompt) => (
              <div key={prompt.id} className="relative group">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RemoveFromCatalogButton
                    catalogId={id}
                    promptId={prompt.id}
                    translations={{
                      remove: t("removeFromCatalog", { defaultValue: "Remove from catalog" }),
                      confirmRemove: t("confirmRemove", { defaultValue: "Remove prompt" }),
                      confirmRemoveDescription: t("confirmRemoveDescription", { defaultValue: "Are you sure you want to remove this prompt from the catalog?" }),
                      cancel: t("cancel", { defaultValue: "Cancel" }),
                      confirm: t("confirm", { defaultValue: "Remove" }),
                    }}
                  />
                </div>
                <PromptCard
                  id={prompt.id}
                  title={prompt.title}
                  preview={prompt.preview}
                  isPro={prompt.isPro}
                  copyCount={prompt.copyCount}
                  categories={prompt.categories}
                  tools={prompt.tools}
                  isRTL={isRTL}
                  locale={defaultLocale}
                  isBookmarked={prompt.isBookmarked}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error fetching catalog:", error);
    notFound();
  }
}
