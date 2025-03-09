"use client";

import { SessionProvider } from "next-auth/react";
import LoginForm from "@/components/cms/auth/login-form";
import { Metadata } from "next";

// Metadata must be exported from a server component (page.tsx)
// but we can define it here for reference
export const metadata: Metadata = {
  title: "Admin Login | Promptaat",
  description: "Login to Promptaat Admin Panel",
};

/**
 * Client component for the login page
 * This component handles the client-side rendering of the login form
 * and provides the SessionProvider for authentication
 */
export default function LoginClientPage() {
  // Log page load for debugging
  console.log("[CMS] Login client page rendering");
  
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <LoginForm />
        </div>
      </div>
    </SessionProvider>
  );
}
