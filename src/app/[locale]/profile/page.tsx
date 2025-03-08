import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth/options"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Add debugging function to log information safely
function debugLog(message: string, data?: unknown) {
  try {
    console.log(`[PROFILE DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  } catch {
    // Ignore stringification errors and just log the message
    console.log(`[PROFILE DEBUG] ${message} (Data could not be stringified)`);
  }
}

// Create a fallback translation function that won't throw errors
const createFallbackTranslations = () => {
  const fallbacks = {
    "title": "Profile",
    "name": "Name",
    "email": "Email"
  };
  
  return (key: string, options?: { defaultValue?: string }) => {
    return options?.defaultValue || fallbacks[key as keyof typeof fallbacks] || key;
  };
};

export default async function ProfilePage({
  params: { locale = "en" }
}: {
  params: { locale: string }
}) {
  try {
    debugLog('Rendering profile page, locale:', locale);
    
    // Get translations with proper fallback handling
    let t;
    try {
      t = await getTranslations("Profile");
      debugLog('Translations loaded successfully');
    } catch (err) {
      debugLog('Error getting translations, using fallbacks:', err);
      // Use fallback translations instead of throwing an error
      t = createFallbackTranslations();
    }
    
    // Get session with error handling
    debugLog('Getting server session');
    const session = await getServerSession(authOptions);
    debugLog('Session result:', { hasUser: !!session?.user });
    
    // Check if user is authenticated
    if (!session?.user) {
      debugLog('No session found, redirecting to login');
      redirect(`/${locale}/auth/login`);
    }
    
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{t("name")}</h3>
                <p>{session?.user?.name || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="font-medium">{t("email")}</h3>
                <p>{session?.user?.email || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (err) {
    // Log the error
    console.error('[PROFILE ERROR]', err);
    
    // Return an error UI instead of crashing
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto border-red-200">
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>
              There was a problem loading your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>Session Error</AlertTitle>
              <AlertDescription>
                We encountered an error retrieving your profile data. Please try logging out and logging in again.
                <div className="mt-2">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {err instanceof Error ? err.message : 'Unknown error'}
                  </pre>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }
}
