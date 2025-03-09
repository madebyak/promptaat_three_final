"use client";

import Dashboard from "./dashboard";

interface DashboardClientProps {
  admin: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isActive: boolean;
  };
}

/**
 * Client component wrapper for the dashboard
 * This component handles the client-side rendering of the dashboard
 */
export default function DashboardClient({ admin }: DashboardClientProps) {
  return <Dashboard admin={admin} />;
}
