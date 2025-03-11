'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useParams } from "next/navigation"

interface SearchBarProps {
  placeholder?: string
  onChange?: (value: string) => void
  value?: string
}

export function SearchBar({ placeholder = "Search prompts...", onChange, value = "" }: SearchBarProps) {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === 'ar';
  
  return (
    <div className="relative">
      <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 h-4 w-4 -translate-y-1/2 text-light-grey`} />
      <Input
        className={isRTL ? "pr-9" : "pl-9"}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        value={value}
        dir={isRTL ? "rtl" : "ltr"}
      />
    </div>
  )
}
