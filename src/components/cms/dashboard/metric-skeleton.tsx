"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PopularPromptsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 border-b last:border-0">
          <div className="space-y-1">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-3 border-b last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}
