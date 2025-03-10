import { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Tools Management | Promptaat Admin",
  description: "Manage AI tools for prompts",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToolsContent>{children}</ToolsContent>;
}

// Separate component for the tools content
function ToolsContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tools</h2>
          <p className="text-muted-foreground">
            Manage AI tools that can be associated with prompts
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading tools...</p>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
} 