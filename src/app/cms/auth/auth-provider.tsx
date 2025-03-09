"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Session Monitor component to track auth state and handle issues
function SessionMonitor() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [lastStatus, setLastStatus] = useState<string>('unknown');
  
  // Log authentication status changes for debugging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    
    // Only log when status actually changes
    if (status !== lastStatus) {
      console.log(`[${timestamp}] [AuthProvider] Session status changed: ${lastStatus} → ${status}`, {
        hasSession: !!session,
        pathname
      });
      setLastStatus(status);
    }
    
    // Periodically check the custom token for consistency
    const checkCustomToken = async () => {
      try {
        // Only check for consistency if we have a NextAuth session
        if (status === "authenticated" && session) {
          console.log(`[${timestamp}] [AuthProvider] Checking token consistency...`);
          
          // Use URL without trailing slash to match our configuration
          const response = await fetch("/api/cms/auth/login?revalidate=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          
          if (!response.ok) {
            console.warn(`[${timestamp}] [AuthProvider] Token revalidation failed:`, response.status);
          } else {
            console.log(`[${timestamp}] [AuthProvider] Token consistency check successful`);
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
  }, [session, status, pathname, lastStatus]);
  
  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('[AuthProvider] Initializing CMS auth provider');
  
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SessionMonitor />
      {children}
    </SessionProvider>
  );
}
