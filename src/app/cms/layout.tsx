import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Sidebar } from "@/components/layout/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CMS")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  )
}
