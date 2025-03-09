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
      
      // Sign out from NextAuth session
      await signOut({ redirect: false });
      
      console.log("Successfully logged out from NextAuth");
      
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
