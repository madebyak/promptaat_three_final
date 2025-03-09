"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Client component wrapper for CMS pages
 * This provides the NextAuth SessionProvider for all CMS pages
 */
export default function CMSClientLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
