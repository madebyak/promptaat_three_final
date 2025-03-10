"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import QueryClientProvider from "@/components/providers/query-client-provider";

/**
 * Global authentication session provider
 * This wraps the entire application with NextAuth's SessionProvider
 * and React Query's QueryClientProvider to enable authentication and data fetching
 * across all pages
 */
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <QueryClientProvider>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
