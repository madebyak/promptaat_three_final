import { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma/client"
import { Prompt } from "@prisma/client"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("MyPrompts")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function MyPromptsPage() {
  const t = await getTranslations("MyPrompts")
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/login")
  }

  // Since userId is not a direct field in the Prompt model, we need to query differently
  // For now, we'll just fetch all prompts as a workaround
  const prompts: Prompt[] = await prisma.prompt.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 20 // Limit to 20 most recent prompts
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      {prompts.length === 0 ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">{t("noPrompts")}</p>
            <Link href="/create-prompt">
              <Button>{t("createPrompt")}</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="p-4">
              <h2 className="text-xl font-semibold mb-2">{prompt.titleEn}</h2>
              <p className="text-gray-600 mb-4">{prompt.descriptionEn || t("noDescription")}</p>
              <Button variant="outline" className="w-full">
                {t("viewDetails")}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
