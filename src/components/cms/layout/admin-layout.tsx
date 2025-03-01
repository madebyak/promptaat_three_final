"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Menu,
  X,
  ChevronDown,
  LogOut
} from "lucide-react";
import { SidebarNav } from "./sidebar-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export default function AdminLayout({ children, admin }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/cms/auth/logout", {
        method: "POST",
      });
      router.push("/cms/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 bg-gray-900/80 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <Link href="/cms/dashboard">
            <Image
              src="/Promptaat_logo_black.svg"
              alt="Promptaat Logo"
              width={120}
              height={32}
              priority
            />
          </Link>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="h-[calc(100vh-64px)]">
          <SidebarNav onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <Link href="/cms/dashboard">
              <Image
                src="/Promptaat_logo_black.svg"
                alt="Promptaat Logo"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className="flex flex-col flex-grow">
            <SidebarNav onLogout={handleLogout} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-x-1 text-sm font-medium leading-6 text-gray-900"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="hidden lg:flex">
                    {admin.firstName} {admin.lastName}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">
                        {admin.firstName} {admin.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                    </div>
                    <Link
                      href="/cms/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
