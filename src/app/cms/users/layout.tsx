import { getCurrentAdmin } from "@/lib/cms/auth/server-auth";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/cms/layout/admin-layout";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current admin
  const admin = await getCurrentAdmin();
  
  // If not authenticated, redirect to login
  if (!admin) {
    redirect("/cms/auth/login");
  }
  
  return (
    <AdminLayout admin={admin}>
      {children}
    </AdminLayout>
  );
}
