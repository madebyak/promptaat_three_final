"use client";

import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const error = searchParams.get('error') || 'Default';

  const errorMessages: Record<string, string> = {
    'OAuthSignin': 'Error occurred while signing in with OAuth provider.',
    'OAuthCallback': 'Error occurred during OAuth callback.',
    'OAuthCreateAccount': 'Error occurred while creating OAuth account.',
    'EmailCreateAccount': 'Error occurred while creating email account.',
    'Callback': 'Error occurred during callback.',
    'OAuthAccountNotLinked': 'This email is already associated with another account.',
    'EmailSignin': 'Error occurred while sending the verification email.',
    'CredentialsSignin': 'Invalid credentials. Please check your email and password.',
    'SessionRequired': 'You must be signed in to access this page.',
    'Default': 'An error occurred during authentication.'
  };

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p className="text-gray-500 dark:text-gray-400">{errorMessage}</p>
      </div>
      <div className="flex justify-center">
        <Button asChild>
          <Link href={routes.home(locale)}>
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
