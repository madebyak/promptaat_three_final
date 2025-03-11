'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useQuery } from '@tanstack/react-query'
import { fetchTools } from '@/lib/api/tools'
import { Tool } from '@/types/prompts'

interface ToolsFilterProps {
  onValueChange?: (value: string[] | null) => void
  value?: string[] | null
  locale?: string
  isRTL?: boolean
  className?: string
}

export function ToolsFilter({ 
  onValueChange, 
  value = null, 
  locale = 'en', 
  isRTL = false, 
  className 
}: ToolsFilterProps) {
  const [open, setOpen] = useState(false)
  const [selectedTools, setSelectedTools] = useState<Tool[]>([])
  
  // Fetch tools data
  const { data, isLoading } = useQuery({
    queryKey: ['tools', locale],
    queryFn: () => fetchTools(locale),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
  
  // Extract tools from the response using useMemo to avoid dependency issues
  const tools = React.useMemo<Tool[]>(() => {
    return data?.tools || [];
  }, [data]);

  // Find tools by IDs when value changes from parent
  useEffect(() => {
    // Skip effect if tools aren't loaded yet
    if (!tools.length) return;
    
    if (value && Array.isArray(value) && value.length > 0) {
      // Check if we need to update selectedTools by comparing IDs
      const currentIds = selectedTools.map(t => t.id).sort().join(',');
      const newIds = value.sort().join(',');
      
      // Only update if the IDs have actually changed
      if (currentIds !== newIds) {
        const foundTools = tools.filter(t => value.includes(t.id));
        setSelectedTools(foundTools);
      }
    } else if (selectedTools.length > 0) {
      // Only clear if there's something to clear
      setSelectedTools([]);
    }
  }, [value, tools, selectedTools])

  const handleSelect = (tool: Tool) => {
    // Prevent the dropdown from closing after selection
    setTimeout(() => setOpen(true), 0);
    
    let newSelectedTools: Tool[];
    const isSelected = selectedTools.some((t: Tool) => t.id === tool.id);
    
    if (isSelected) {
      // Remove the tool if already selected
      newSelectedTools = selectedTools.filter((t: Tool) => t.id !== tool.id);
    } else {
      // Add the tool if not already selected
      newSelectedTools = [...selectedTools, tool];
    }
    
    setSelectedTools(newSelectedTools);
    
    // Only call onValueChange if the parent component provided it
    if (onValueChange) {
      const newValue = newSelectedTools.length > 0 ? newSelectedTools.map((t: Tool) => t.id) : null;
      onValueChange(newValue);
    }
  }

  const handleClearAll = (e?: React.MouseEvent): void => {
    e?.stopPropagation();
    setSelectedTools([]);
    
    // Only call onValueChange if the parent component provided it
    if (onValueChange) {
      onValueChange(null);
    }
    
    if (!e) setOpen(false); // Only close if not triggered by a click event
  }
  
  const handleRemoveTool = (toolId: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    const newSelectedTools = selectedTools.filter((t: Tool) => t.id !== toolId);
    setSelectedTools(newSelectedTools);
    
    // Only call onValueChange if the parent component provided it
    if (onValueChange) {
      const newValue = newSelectedTools.length > 0 ? newSelectedTools.map((t: Tool) => t.id) : null;
      onValueChange(newValue);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            isRTL && "font-ibm-plex-sans-arabic text-right",
            className
          )}
        >
          {selectedTools.length > 0 ? (
            <div className="flex items-center gap-1 max-w-full truncate">
              <Badge 
                variant="secondary" 
                className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold"
              >
                {selectedTools.length}
              </Badge>
              <span className={cn("truncate text-sm", isRTL && "font-ibm-plex-sans-arabic")}>
                {isRTL ? "أدوات محددة" : "tools selected"}
              </span>
              <X 
                className="h-3.5 w-3.5 opacity-60 cursor-pointer hover:opacity-100 ml-1" 
                onClick={(e) => handleClearAll(e)}
              />
            </div>
          ) : (
            <span className={cn("text-slate-500", isRTL && "font-ibm-plex-sans-arabic")}>
              {isRTL ? "تصفية حسب الأداة" : "Filter by tool"}
            </span>
          )}
          <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", isRTL ? "mr-2" : "ml-2")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[180px] md:w-[200px] p-0", isRTL && "font-ibm-plex-sans-arabic")}>
        <Command className={isRTL ? "text-right" : ""}>
          <CommandInput 
            placeholder={isRTL ? "البحث عن أداة..." : "Search tools..."} 
            className={isRTL ? "font-ibm-plex-sans-arabic text-right" : ""}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm">
              {isRTL ? "لم يتم العثور على أدوات مطابقة" : "No matching tools found"}
            </CommandEmpty>
            
            {/* Clear all button */}
            {selectedTools.length > 0 && (
              <div className="p-1 border-b">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleClearAll()}
                >
                  {isRTL ? "مسح الكل" : "Clear all"}
                </Button>
              </div>
            )}
            
            {/* Selected tools section */}
            {selectedTools.length > 0 && (
              <div className="p-1 border-b">
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  {isRTL ? "الأدوات المحددة:" : "Selected tools:"}
                </p>
                <div className="flex flex-wrap gap-1 p-1">
                  {selectedTools.map(tool => (
                    <Badge 
                      key={tool.id}
                      variant="outline" 
                      className="flex items-center gap-1 py-0.5 px-2"
                    >
                      <span className="text-xs">{tool.name}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={(e) => handleRemoveTool(tool.id, e)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <CommandGroup>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "لا توجد أدوات متاحة حالياً" : "No tools available at the moment"}
                  </p>
                </div>
              ) : (
                tools.map((tool: Tool) => (
                  <CommandItem
                    key={tool.id}
                    value={tool.name}
                    onSelect={() => handleSelect(tool)}
                    className={cn(
                      "flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
                      selectedTools.some((t: Tool) => t.id === tool.id) && "bg-accent/50",
                      isRTL && "flex-row-reverse justify-between"
                    )}
                  >
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      {tool.iconUrl && (
                        <span className="flex-shrink-0 w-4 h-4 overflow-hidden relative">
                          <Image
                            src={tool.iconUrl}
                            alt={tool.name}
                            fill
                            sizes="16px"
                            className="object-contain"
                            onError={() => {
                              // Do nothing on error - Next.js Image handles this gracefully
                            }}
                          />
                        </span>
                      )}
                      <span>{tool.name}</span>
                    </div>
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-sm border border-primary/20">
                      {selectedTools.some((t: Tool) => t.id === tool.id) && (
                        <Check className={cn("h-3.5 w-3.5 text-primary", isRTL && "mr-auto")} />
                      )}
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
