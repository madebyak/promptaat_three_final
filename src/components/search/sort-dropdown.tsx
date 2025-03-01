'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "most_used", label: "Most Used" },
]

interface SortDropdownProps {
  onValueChange?: (value: string) => void
  className?: string
  isRTL?: boolean
}

export function SortDropdown({ onValueChange, className, isRTL = false }: SortDropdownProps) {
  const [value, setValue] = React.useState("")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-between",
            isRTL && "font-ibm-plex-sans-arabic text-right",
            className
          )}
        >
          {value ? sortOptions.find(opt => opt.value === value)?.label : "Sort by..."}
          <ChevronsUpDown className={cn(
            "h-4 w-4 shrink-0 opacity-50",
            isRTL ? "mr-2" : "ml-2"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className={cn(
          "w-[200px]",
          isRTL && "font-ibm-plex-sans-arabic text-right"
        )}
      >
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => {
              setValue(option.value)
              onValueChange?.(option.value)
            }}
            className={cn(
              "justify-between",
              isRTL && "flex-row-reverse"
            )}
          >
            {option.label}
            {value === option.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
