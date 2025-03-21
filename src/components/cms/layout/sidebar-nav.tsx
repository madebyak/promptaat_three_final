"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FolderTree,
  FileText,
  Users,
  Settings,
  LogOut,
  Wrench,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarNavProps {
  onLogout: () => void;
}

export function SidebarNav({ onLogout }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/cms/dashboard",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "Categories",
      href: "/cms/categories",
      icon: <FolderTree className="mr-2 h-4 w-4" />,
    },
    {
      title: "Tools",
      href: "/cms/tools",
      icon: <Wrench className="mr-2 h-4 w-4" />,
    },
    {
      title: "Prompts",
      href: "/cms/prompts",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Blogs",
      href: "/cms/blogs",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Changelog",
      href: "/cms/changelog",
      icon: <Clock className="mr-2 h-4 w-4" />,
    },
    {
      title: "Users",
      href: "/cms/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/cms/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-1 pt-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
