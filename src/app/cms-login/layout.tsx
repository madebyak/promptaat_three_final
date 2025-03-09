"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Dedicated layout for the CMS login page
 * This isolates the login page from the rest of the application
 * and provides its own SessionProvider context
 */
export default function CMSLoginLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        {children}
      </div>
    </SessionProvider>
  );
}
