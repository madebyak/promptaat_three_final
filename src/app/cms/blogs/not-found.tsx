'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BlogNotFound() {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center",
    )}>
      <h1 className="text-4xl font-bold mb-4">
        Blog Post Not Found
      </h1>
      <p className="text-lg mb-8 text-gray-600 dark:text-gray-300 max-w-md">
        Sorry, the blog post you are looking for does not exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/cms/blogs" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs Dashboard</span>
        </Link>
      </Button>
    </div>
  );
}
