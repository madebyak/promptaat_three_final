import { Metadata } from "next";
import QueryClientProvider from "@/components/cms/providers/query-client-provider";
import ToolsManagementWrapper from "@/components/cms/tools/tools-management-wrapper";

export const metadata: Metadata = {
  title: "Tools Management | Promptaat Admin",
  description: "Manage AI tools for prompts",
};

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tools Management</h1>
      </div>
      
      <QueryClientProvider>
        <ToolsManagementWrapper />
      </QueryClientProvider>
    </div>
  );
} 