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
  value?: string
}

export function SortDropdown({ onValueChange, className, isRTL = false, value = "" }: SortDropdownProps) {
  // Use a local state that syncs with the prop value
  const [localValue, setLocalValue] = React.useState(value)
  
  // Update local state when prop changes
  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    setLocalValue(selectedValue)
    onValueChange?.(selectedValue)
  }

  const displayLabel = localValue 
    ? sortOptions.find(opt => opt.value === localValue)?.label 
    : "Sort by..."

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between bg-light-grey-light dark:bg-dark hover:bg-light-grey-light dark:hover:bg-dark border-0",
            isRTL && "font-ibm-plex-sans-arabic text-right",
            className
          )}
        >
          <span className="dark:text-white-pure">{displayLabel}</span>
          <ChevronsUpDown className={cn(
            "h-4 w-4 shrink-0 opacity-50 dark:text-white-pure",
            isRTL ? "mr-2" : "ml-2"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? "start" : "end"}
        className={cn(
          "w-[180px] md:w-[200px]",
          isRTL && "font-ibm-plex-sans-arabic text-right"
        )}
      >
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handleSelect(option.value)}
            className={cn(
              "justify-between",
              isRTL && "flex-row-reverse"
            )}
          >
            {option.label}
            {localValue === option.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
