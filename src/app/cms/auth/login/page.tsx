import { Metadata } from "next";
import LoginForm from "@/components/cms/auth/login-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Login | Promptaat",
  description: "Login to Promptaat Admin Panel",
};

export default async function AdminLoginPage() {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);
  
  // If already authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/cms/dashboard");
  }
  
  return <LoginForm />;
}
