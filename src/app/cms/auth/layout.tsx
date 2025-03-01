import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promptaat Admin - Authentication",
  description: "Authentication for Promptaat admin panel",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
