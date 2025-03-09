"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // First, clear the custom JWT tokens through the API
      const response = await fetch("/api/cms/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Custom token logout failed");
      }
      
      // Then, sign out from NextAuth session
      await signOut({ redirect: false });
      
      console.log("Successfully logged out from both auth systems");
      
      // Redirect to login page after successful logout
      router.push("/cms/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
