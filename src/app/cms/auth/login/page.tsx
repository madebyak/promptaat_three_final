import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Login | Promptaat",
  description: "Login to Promptaat Admin Panel",
};

// Force dynamic rendering to ensure the page is always fresh
export const dynamic = 'force-dynamic';

// Server component that redirects to the standalone CMS login page
export default function AdminLoginPage() {
  // Log page load for debugging
  console.log("[CMS] Login page rendering, redirecting to standalone login");
  
  // Use Next.js redirect for server-side redirection
  // This avoids client-side React context issues
  redirect('/cms-login');
}
