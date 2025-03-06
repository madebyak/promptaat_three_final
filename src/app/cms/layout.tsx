import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Sidebar } from "@/components/layout/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { LayoutDashboard, MessageSquare, FolderTree, Wrench, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CMS")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function CMSLayout({
  children,
  params: { locale = 'en' }
}: {
  children: React.ReactNode
  params: { locale?: string }
}) {
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions)
  
  // Get the default locale if none is provided
  const currentLocale = locale || 'en';
  
  if (!session?.user) {
    // Redirect to the CMS auth login page
    redirect(`/cms/auth/login?callbackUrl=/cms/dashboard`)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        locale={currentLocale}
        items={[
          {
            href: "/cms/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/cms/prompts",
            label: "Prompts",
            icon: MessageSquare,
          },
          {
            href: "/cms/categories",
            label: "Categories",
            icon: FolderTree,
          },
          {
            href: "/cms/tools",
            label: "Tools",
            icon: Wrench,
          },
          {
            href: "/cms/users",
            label: "Users",
            icon: Users,
          },
        ]}
      />
      <main className="flex-1 overflow-y-auto bg-muted/10">
        <div className="container py-8">{children}</div>
      </main>
    </div>
  )
}
