"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

// Dynamically import the ToolsManagement component
const ToolsManagement = dynamic(
  () => import("@/components/cms/tools/tools-management"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }
);

export default function ToolsManagementWrapper() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    }>
      <ToolsManagement />
    </Suspense>
  );
} 