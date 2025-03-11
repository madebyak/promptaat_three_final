"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PopularPromptsSkeleton } from "./metric-skeleton";
import { formatDistanceToNow } from "date-fns";
import { arSA, enUS } from "date-fns/locale";

interface PopularPrompt {
  id: string;
  titleEn: string;
  titleAr: string;
  copyCount: number;
  createdAt: string;
}

interface PopularPromptsProps {
  prompts: PopularPrompt[] | undefined;
  loading: boolean;
  locale?: string;
}

export default function PopularPrompts({ prompts, loading, locale = 'en' }: PopularPromptsProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              Popular Prompts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>
          <CardDescription>Most used prompts</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <PopularPromptsSkeleton />
        </CardContent>
      </Card>
    );
  }

  // If no prompts or empty array
  if (!prompts || prompts.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              Popular Prompts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/cms/prompts">View All</Link>
            </Button>
          </div>
          <CardDescription>Most used prompts</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-muted-foreground text-center py-8">No prompts data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-500" />
            Popular Prompts
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/cms/prompts">View All</Link>
          </Button>
        </div>
        <CardDescription>Most used prompts</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1">
          {prompts.map((prompt) => {
            const title = locale === 'ar' && prompt.titleAr ? prompt.titleAr : prompt.titleEn;
            const dateLocale = locale === 'ar' ? arSA : enUS;
            const timeAgo = formatDistanceToNow(new Date(prompt.createdAt), { 
              addSuffix: true,
              locale: dateLocale
            });
            
            return (
              <div key={prompt.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors">
                <div>
                  <h3 className="font-medium text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{prompt.copyCount} uses</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/cms/prompts/edit/${prompt.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Edit prompt</span>
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
