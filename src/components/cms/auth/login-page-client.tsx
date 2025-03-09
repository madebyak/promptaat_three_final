"use client";

import LoginForm from "@/components/cms/auth/login-form";

/**
 * Client component wrapper for the login page
 * This component handles the client-side rendering of the login form
 */
export default function LoginPageClient() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
