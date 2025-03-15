'use client';

import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

interface ProUpgradeMessageProps {
  locale: string;
}

export function ProUpgradeMessage({ locale }: ProUpgradeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
      <div className="bg-gradient-to-r from-purple-500 to-green-500 text-white p-4 rounded-full mb-6">
        <Crown className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold mb-3">
        {locale === 'ar' ? 'الوصول مقيد للمشتركين فقط' : 'Pro Subscribers Only'}
      </h1>
      <p className="mb-6 text-muted-foreground">
        {locale === 'ar' 
          ? 'هذه الميزة متاحة فقط لمشتركي الخطة المميزة. يرجى الترقية للوصول.' 
          : 'This feature is only available to Pro subscribers. Please upgrade to access.'}
      </p>
      <Button 
        className="bg-gradient-to-r from-purple-500 to-green-500 text-white"
        asChild
      >
        <Link href={`/${locale}/subscription`}>
          {locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
        </Link>
      </Button>
    </div>
  );
}
