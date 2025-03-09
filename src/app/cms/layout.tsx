import { Metadata } from "next"
import { Sidebar } from "@/components/layout/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import AuthProvider from "./auth/auth-provider"
import { getCurrentAdmin } from "@/lib/cms/auth/server-auth"
import { UserCircle } from "lucide-react"
import LogoutButtonWrapper from "@/components/cms/auth/logout-button-wrapper"
import { NextIntlClientProvider } from "next-intl"

export const metadata: Metadata = {
  title: "Promptaat CMS",
  description: "Content Management System for Promptaat",
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
    redirect(`/cms/auth/login`)
  }
  
  // Get admin information for the header
  const admin = await getCurrentAdmin()
  
  // Load messages for the current locale
  let messages = {};
  try {
    // Use dynamic import to load messages
    messages = (await import(`../../../messages/${currentLocale}.json`)).default;
    console.log(`Successfully loaded messages for locale: ${currentLocale}`);
  } catch (error) {
    console.error(`Failed to load messages for locale: ${currentLocale}`, error);
    // Fallback to English if the requested locale is not available
    if (currentLocale !== 'en') {
      try {
        messages = (await import(`../../../messages/en.json`)).default;
        console.log('Falling back to English messages');
      } catch (fallbackError) {
        console.error('Failed to load fallback English messages', fallbackError);
        // Initialize with an empty object if all else fails
        messages = {};
      }
    }
  }

  return (
    <AuthProvider>
      <NextIntlClientProvider locale={currentLocale} messages={messages} timeZone="Asia/Riyadh">
        <div className="flex min-h-screen">
        <Sidebar
          locale={currentLocale}
          items={[
          {
            href: "/cms/dashboard",
            label: "Dashboard",
            icon: "LayoutDashboard",
          },
          {
            href: "/cms/prompts",
            label: "Prompts",
            icon: "MessageSquare",
          },
          {
            href: "/cms/categories",
            label: "Categories",
            icon: "FolderTree",
          },
          {
            href: "/cms/tools",
            label: "Tools",
            icon: "Wrench",
          },
          {
            href: "/cms/users",
            label: "Users",
            icon: "Users",
          },
        ]}
      />
      <div className="flex-1 flex flex-col">
        {/* Header with admin information */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Promptaat Admin</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">
                    {admin?.firstName ? `${admin.firstName} ${admin.lastName || ''}` : admin?.email}
                  </p>
                  <p className="text-xs text-gray-500">Logged in as: {admin?.email}</p>
                </div>
              </div>
              
              <LogoutButtonWrapper />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
      </NextIntlClientProvider>
    </AuthProvider>
  )
}
