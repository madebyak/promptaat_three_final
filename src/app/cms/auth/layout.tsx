"use client";

import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";

// Note: Metadata is in metadata.ts since this is a client component

// Inner component that uses session data
function AuthLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removed useSession, useRouter, and useEffect hooks that were causing redirect loops
  // Server-side handling in page.tsx and manual redirect in login-form.tsx will manage redirects instead
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Image
              src="/Promptaat_logo_black.svg"
              alt="Promptaat Logo"
              width={180}
              height={48}
              priority
              className="mx-auto"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Admin Panel
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>
          {children}
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex h-full items-center justify-center">
            <div className="px-8 text-center text-white">
              <h1 className="text-4xl font-bold">Promptaat Admin</h1>
              <p className="mt-4 text-xl">
                Manage your content, users, and analytics
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

// Main layout component that provides the session
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </SessionProvider>
  );
}
