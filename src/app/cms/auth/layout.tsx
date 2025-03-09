import { SessionProvider } from "next-auth/react";

// This layout is for the CMS auth pages only
// CMS only supports English, no internationalization needed
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="cms-auth-layout">
        {children}
      </div>
    </SessionProvider>
  );
}
