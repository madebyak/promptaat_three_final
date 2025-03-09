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
  // Initialize variables with default values
  const currentLocale = locale || 'en';
  let messages = {};
  // Define types to avoid TypeScript errors
  type AdminData = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  } | null;
  
  // Define session type
  type SessionData = {
    user?: {
      id?: string;
      email?: string;
      name?: string;
    };
  } | null;
  
  let adminData: AdminData = null;

  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] CMS Layout - Checking authentication`);
    
    // Check both authentication methods
    const results = await Promise.allSettled([
      getServerSession(authOptions),
      getCurrentAdmin()
    ]);
    const sessionResult = results[0];
    const adminResult = results[1];
    
    // Log authentication status for debugging
    console.log(`[${timestamp}] CMS Layout - Auth check results:`, {
      sessionStatus: sessionResult.status,
      hasSession: sessionResult.status === 'fulfilled' && !!(sessionResult as PromiseFulfilledResult<SessionData>).value?.user,
      adminStatus: adminResult.status,
      hasAdmin: adminResult.status === 'fulfilled' && !!(adminResult as PromiseFulfilledResult<AdminData>).value
    });
    
    // Check if the user is authenticated through either method
    const hasSession = sessionResult.status === 'fulfilled' && !!(sessionResult as PromiseFulfilledResult<SessionData>).value?.user;
    const hasAdmin = adminResult.status === 'fulfilled' && !!(adminResult as PromiseFulfilledResult<AdminData>).value;
    
    if (!hasSession && !hasAdmin) {
      // Neither authentication method succeeded, redirect to login
      console.log(`[${timestamp}] CMS Layout - No valid authentication found, redirecting to login`);
      redirect(`/cms/auth/login?source=layout`);
    }
    
    // Set admin information from the result we already have
    if (adminResult.status === 'fulfilled' && (adminResult as PromiseFulfilledResult<AdminData>).value) {
      console.log(`[${timestamp}] CMS Layout - Using admin info from getCurrentAdmin`);
      adminData = (adminResult as PromiseFulfilledResult<AdminData>).value;
    } else {
      // If getCurrentAdmin failed but we still have a session, try to create a minimal admin object
      if (hasSession && sessionResult.status === 'fulfilled' && (sessionResult as PromiseFulfilledResult<SessionData>).value?.user) {
        console.log(`[${timestamp}] CMS Layout - Creating admin info from session`);
        const sessionData = (sessionResult as PromiseFulfilledResult<SessionData>).value;
        const sessionUser = sessionData?.user;
        
        if (sessionUser) {
          adminData = {
            id: sessionUser.id ?? 'unknown',
            email: sessionUser.email ?? 'unknown@example.com',
            firstName: sessionUser.name ? sessionUser.name.split(' ')[0] : 'Admin',
            lastName: sessionUser.name ? sessionUser.name.split(' ').slice(1).join(' ') : 'User',
            role: 'admin'
          };
        }
      }
      
      if (!adminData) {
        console.error(`[${timestamp}] CMS Layout - Failed to get or create admin information`);
        // Continue without admin info - it's better than crashing the page
      }
    }
    
    // Load messages for the current locale
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
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error(`[${timestamp}] Critical error in CMS layout:`, errorMessage);
    console.error(`[${timestamp}] Error stack:`, errorStack);
    
    // Redirect to login on critical errors with error parameter for tracking
    redirect(`/cms/auth/login?error=layout_error`);
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
                    {adminData?.firstName ? `${adminData.firstName} ${adminData.lastName || ''}` : adminData?.email}
                  </p>
                  <p className="text-xs text-gray-500">Logged in as: {adminData?.email}</p>
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
