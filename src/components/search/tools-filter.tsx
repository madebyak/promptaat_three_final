'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Check, ChevronsUpDown, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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

// Custom image component with error handling and fallback
function ToolIcon({ src, alt }: { src?: string, alt: string }) {
  const [imgError, setImgError] = useState(false);
  
  if (!src || imgError) {
    // Return a fallback icon with the first letter of the tool name
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  
  return (
    <div className="flex-shrink-0 w-5 h-5 relative">
      <Image
        src={src}
        alt={alt}
        width={20}
        height={20}
        className="object-contain"
        onError={() => setImgError(true)}
      />
    </div>
  );
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
  
  // Improved tools data fetching with better error handling
  const { data, isLoading, error } = useQuery({
    queryKey: ['tools', locale],
    queryFn: () => fetchTools(locale),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // Retry failed requests twice
  })
  
  // Extract tools from the response
  const tools = React.useMemo<Tool[]>(() => {
    return data?.tools || [];
  }, [data]);

  // Find tools by IDs when value changes from parent
  useEffect(() => {
    if (!tools.length) return;
    
    if (value && Array.isArray(value) && value.length > 0) {
      const currentIds = selectedTools.map(t => t.id).sort().join(',');
      const newIds = value.sort().join(',');
      
      if (currentIds !== newIds) {
        const foundTools = tools.filter(t => value.includes(t.id));
        setSelectedTools(foundTools);
      }
    } else if (selectedTools.length > 0) {
      setSelectedTools([]);
    }
  }, [value, tools, selectedTools]);

  // Direct click handler instead of relying on onSelect
  const handleToolClick = useCallback((tool: Tool, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSelectedTools(prev => {
      const isSelected = prev.some((t) => t.id === tool.id);
      let newTools;
      
      if (isSelected) {
        // Remove the tool if already selected
        newTools = prev.filter((t) => t.id !== tool.id);
      } else {
        // Add the tool if not already selected
        newTools = [...prev, tool];
      }
      
      return newTools;
    });
    
    // Keep the dropdown open
    setTimeout(() => {
      setOpen(true);
    }, 0);
  }, []);

  // Use useEffect to notify parent component of changes
  useEffect(() => {
    if (selectedTools.length === 0 && !value) {
      return; // Avoid unnecessary updates
    }
    
    if (onValueChange) {
      const newValue = selectedTools.length > 0 ? selectedTools.map((t) => t.id) : null;
      onValueChange(newValue);
    }
  }, [selectedTools, onValueChange, value]);

  const handleClearAll = useCallback((e?: React.MouseEvent): void => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setSelectedTools([]);
    
    if (!e) setOpen(false);
  }, []);
  
  const handleRemoveTool = useCallback((toolId: string, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedTools(prev => {
      return prev.filter((t) => t.id !== toolId);
    });
  }, []);

  // Prevent dropdown from closing when selecting
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between hover:bg-accent-purple/10 border-light-grey hover:border-accent-purple transition-colors",
            selectedTools.length > 0 && "border-accent-purple/60 bg-accent-purple/5",
            isRTL && "font-ibm-plex-sans-arabic text-right",
            className
          )}
        >
          {selectedTools.length > 0 ? (
            <div className="flex items-center gap-1 max-w-full truncate">
              <Badge 
                variant="secondary" 
                className="bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple font-medium"
              >
                {selectedTools.length}
              </Badge>
              <span className={cn("truncate text-sm", isRTL && "font-ibm-plex-sans-arabic")}>
                {isRTL ? "أدوات محددة" : "tools selected"}
              </span>
              <X 
                className="h-3.5 w-3.5 opacity-60 cursor-pointer hover:opacity-100 ml-1 text-accent-purple" 
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
      <PopoverContent 
        className={cn(
          "w-[220px] md:w-[240px] p-0",
          isRTL && "font-ibm-plex-sans-arabic"
        )}
        align={isRTL ? "end" : "start"}
      >
        <Command className={isRTL ? "text-right" : ""}>
          <CommandInput 
            placeholder={isRTL ? "البحث عن أداة..." : "Search tools..."} 
            className={isRTL ? "font-ibm-plex-sans-arabic text-right" : ""}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <CommandList className="max-h-[300px] custom-scrollbar">
            <CommandEmpty className="py-3 text-center text-sm">
              {isRTL ? "لم يتم العثور على أدوات مطابقة" : "No matching tools found"}
            </CommandEmpty>
            
            {/* Clear all button */}
            {selectedTools.length > 0 && (
              <div className="p-1 border-b border-light-grey dark:border-dark-grey">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-center text-sm text-accent-purple hover:text-accent-purple-dark hover:bg-accent-purple/10"
                  onClick={() => handleClearAll()}
                >
                  {isRTL ? "مسح الكل" : "Clear all"}
                </Button>
              </div>
            )}
            
            {/* Selected tools section */}
            {selectedTools.length > 0 && (
              <div className="p-1 border-b border-light-grey dark:border-dark-grey">
                <p className="px-2 py-1 text-xs text-muted-foreground">
                  {isRTL ? "الأدوات المحددة:" : "Selected tools:"}
                </p>
                <div className="flex flex-wrap gap-1 p-1">
                  {selectedTools.map(tool => (
                    <Badge 
                      key={tool.id}
                      variant="outline" 
                      className="flex items-center gap-1 py-0.5 px-2 border-accent-purple/40 bg-accent-purple/5"
                    >
                      <span className="text-xs">{tool.name}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer text-accent-purple hover:text-accent-purple-dark" 
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
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-purple border-t-transparent" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 px-2 text-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "فشل في تحميل الأدوات" : "Failed to load tools"}
                  </p>
                </div>
              ) : tools.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "لا توجد أدوات متاحة حالياً" : "No tools available at the moment"}
                  </p>
                </div>
              ) : (
                tools.map((tool: Tool) => (
                  <div
                    key={tool.id}
                    onClick={(e) => handleToolClick(tool, e)}
                    className={cn(
                      "flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-sm transition-colors duration-200",
                      "text-foreground dark:text-slate-200 hover:bg-accent hover:text-accent-foreground",
                      selectedTools.some((t) => t.id === tool.id) ? "bg-accent-purple/10 dark:bg-accent-purple/20" : "",
                      isRTL && "flex-row-reverse justify-between"
                    )}
                  >
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <ToolIcon src={tool.iconUrl} alt={tool.name} />
                      <span className="text-sm">{tool.name}</span>
                    </div>
                    <div className={cn(
                      "ml-auto flex items-center justify-center",
                      isRTL && "mr-auto ml-0"
                    )}>
                      {selectedTools.some((t) => t.id === tool.id) && (
                        <div className="h-5 w-5 rounded-sm flex items-center justify-center bg-accent-purple/20 dark:bg-accent-purple/40">
                          <Check className="h-3.5 w-3.5 text-accent-purple dark:text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
