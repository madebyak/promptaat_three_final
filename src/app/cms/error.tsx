'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Custom error page for CMS routes
 * This provides a better user experience when errors occur
 * and offers navigation options back to working pages
 */
export default function CMSError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('CMS Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-6 text-gray-600">
          {error.message || 'An unexpected error occurred in the CMS.'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/cms/auth/login" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Go to Login
          </Link>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
