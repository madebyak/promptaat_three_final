import { redirect } from "next/navigation";

// This page handles the /cms/auth route (without trailing slash)
// It simply redirects to the login page
export default function CmsAuthIndexPage() {
  // Enhanced logging to help debug 404 issues
  console.log("=======================================");
  console.log("CMS Auth index page loaded, redirecting to login page");
  console.log("Process ENV:", process.env.NODE_ENV);
  console.log("=======================================");
  
  // Using server-side redirect to the login page
  redirect("/cms/auth/login");
}
