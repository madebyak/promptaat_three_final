"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Global authentication session provider
 * This wraps the entire application with NextAuth's SessionProvider
 * to enable authentication across all pages
 */
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
