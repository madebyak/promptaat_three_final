"use client";

import { Banner } from "@/components/layout/main-content/banner"
import { SearchSection } from "@/components/search/search-section"
import { PromptsGrid } from '@/components/prompts/prompts-grid'
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === 'ar'

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Banner Section */}
      <Banner locale={locale} />

      {/* Search Section */}
      <section className="w-full rounded-lg">
        <SearchSection locale={locale} />
      </section>

      {/* Prompts Grid Section */}
      <section className="w-full">
        <PromptsGrid locale={locale} />
      </section>
    </div>
  )
}
