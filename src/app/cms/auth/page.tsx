import { redirect } from "next/navigation";

// This page handles the /cms/auth route (without trailing slash)
// It simply redirects to the login page
export default function CmsAuthIndexPage() {
  console.log("CMS Auth index page loaded, redirecting to login page");
  redirect("/cms/auth/login");
}
