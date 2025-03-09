import Link from 'next/link';

/**
 * Custom not-found page for CMS routes
 * This helps provide a better user experience when routes aren't found
 * and offers navigation options back to working pages
 */
export default function CMSNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="mb-6 text-gray-600">
          The CMS page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
        </p>
        <div className="flex flex-col gap-3">
          <Link 
            href="/cms/auth/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
