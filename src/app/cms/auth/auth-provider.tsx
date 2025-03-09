"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Session Monitor component to track auth state and handle issues
function SessionMonitor() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // Log authentication status changes for debugging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AuthProvider] Session status changed: ${status}`, {
      hasSession: !!session,
      pathname
    });
    
    // Periodically check the custom token for consistency
    const checkCustomToken = async () => {
      try {
        // Only check for consistency if we have a NextAuth session
        if (status === "authenticated" && session) {
          const response = await fetch("/api/cms/auth/login?revalidate=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          
          if (!response.ok) {
            console.warn(`[${timestamp}] [AuthProvider] Token revalidation failed:`, response.status);
          }
        }
      } catch (error) {
        console.error(`[${timestamp}] [AuthProvider] Error checking authentication:`, error);
      }
    };
    
    // Call immediately and then set up periodic check
    if (status === "authenticated") {
      checkCustomToken();
      
      // Check every 5 minutes to ensure consistency between auth systems
      const interval = setInterval(checkCustomToken, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session, status, pathname]);
  
  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SessionMonitor />
      {children}
    </SessionProvider>
  );
}
