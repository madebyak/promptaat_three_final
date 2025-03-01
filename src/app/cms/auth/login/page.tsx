import { Metadata } from "next";
import LoginForm from "@/components/cms/auth/login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Login | Promptaat",
  description: "Login to Promptaat Admin Panel",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Image
              src="/Promptaat_logo_black.svg"
              alt="Promptaat Logo"
              width={180}
              height={48}
              priority
              className="mx-auto"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Admin Panel
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex h-full items-center justify-center">
            <div className="px-8 text-center text-white">
              <h1 className="text-4xl font-bold">Promptaat Admin</h1>
              <p className="mt-4 text-xl">
                Manage your content, users, and analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
