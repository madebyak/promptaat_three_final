import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import { ProfileCompletionForm } from "@/components/auth/profile-completion-form";
import Image from "next/image";

// Add debugging function for profile completion page
function debugLog(message: string, data?: unknown) {
  try {
    console.log(`[PROFILE-COMPLETION DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  } catch {
    console.log(`[PROFILE-COMPLETION DEBUG] ${message} (Data could not be stringified)`);
  }
}

export default async function ProfileCompletionPage({
  params: { locale = "en" }
}: {
  params: { locale: string }
}) {
  try {
    debugLog('Rendering profile completion page, locale:', locale);
    
    // Get translations
    const t = await getTranslations("ProfileCompletion");
    debugLog('Translations loaded successfully');
    
    // Get current session
    const session = await getServerSession(authOptions);
    debugLog('Session result:', { hasUser: !!session?.user, user: session?.user });
    
    // If no user is logged in, redirect to login
    if (!session?.user) {
      debugLog('No session found, redirecting to login');
      redirect(`/${locale}/auth/login`);
      return null;
    }
    
    // If profile is already complete, redirect to home
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const needsCompletion = (session.user as any).needsProfileCompletion as boolean | undefined;
    if (needsCompletion === false) {
      debugLog('Profile already complete, redirecting to homepage');
      redirect(`/${locale}`);
      return null;
    }
    
    // Define extended user type with the properties we need
    interface ExtendedUser {
      firstName?: string;
      lastName?: string;
      country?: string;
      needsProfileCompletion?: boolean;
    }
    
    // Prepare initial data from user session
    const initialData = {
      firstName: ((session.user as unknown) as ExtendedUser).firstName || "",
      lastName: ((session.user as unknown) as ExtendedUser).lastName || "",
      country: ((session.user as unknown) as ExtendedUser).country || "",
    };
    
    // Translations for the form
    const translations = {
      title: t("title"),
      subtitle: t("subtitle"),
      firstName: t("firstName"),
      lastName: t("lastName"),
      country: t("country"),
      pleaseSelect: t("pleaseSelect"),
      submit: t("submit"),
      submitting: t("submitting"),
      successMessage: t("successMessage"),
      errorMessage: t("errorMessage"),
    };
    
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
          <div className="flex flex-col space-y-2 text-center mb-4">
            <Image 
              src="/assets/logo.svg" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="mx-auto w-auto" 
              priority
            />
          </div>
          
          <div className="grid gap-6 p-6 bg-card rounded-lg border shadow-sm">
            <ProfileCompletionForm 
              locale={locale} 
              initialData={initialData} 
              translations={translations} 
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // Log error and provide fallback UI
    console.error('[PROFILE-COMPLETION ERROR]', error);
    
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
            <h1 className="text-lg font-semibold text-center">Error Loading Profile Completion</h1>
            <p className="text-sm text-center mt-2">
              There was a problem loading the profile completion page. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
