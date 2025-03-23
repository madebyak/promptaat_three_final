'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface Option {
  value: string;
  label: string;
  labelAr?: string;
  flag?: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  isRtl?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  isRtl = false,
  disabled = false,
  icon,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const searchTerm = search.toLowerCase();
    
    // First find exact matches (starts with)
    const exactMatches = options.filter(option => 
      option.label.toLowerCase().startsWith(searchTerm) ||
      (option.labelAr && option.labelAr.toLowerCase().startsWith(searchTerm))
    );
    
    // Then find contains matches
    const containsMatches = options.filter(option => {
      const labelLower = option.label.toLowerCase();
      const labelArLower = option.labelAr ? option.labelAr.toLowerCase() : '';
      
      return (!exactMatches.includes(option) && 
        (labelLower.includes(searchTerm) || labelArLower.includes(searchTerm)));
    });
    
    // Combine both arrays with exact matches first
    return [...exactMatches, ...containsMatches];
  }, [options, search]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "relative flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isRtl ? "text-right" : "text-left",
          icon ? (isRtl ? "pr-10" : "pl-10") : ""
        )}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {icon && (
          <div className={cn(
            "absolute inset-y-0 flex items-center pointer-events-none text-muted-foreground",
            isRtl ? "right-0 pr-3" : "left-0 pl-3"
          )}>
            {icon}
          </div>
        )}
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.flag && <span className="inline-block w-6">{selectedOption.flag}</span>}
            <span>{isRtl ? selectedOption.labelAr || selectedOption.label : selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="sr-only"></div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 overflow-hidden w-full min-w-[280px] max-w-[90vw] sm:max-w-[400px] max-h-[450px] rounded-md border shadow-md"
          align={isRtl ? "end" : "start"}
          sideOffset={5}
          side="bottom"
          alignOffset={0}
          style={{ width: buttonRef.current?.offsetWidth }}
          avoidCollisions
        >
          <Command className="w-full" shouldFilter={false}>
            <div className={cn(
              "flex items-center border-b px-3 sticky top-0 bg-background z-10",
              isRtl ? "flex-row-reverse" : ""
            )}>
              {!isRtl && <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />}
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                className={cn(
                  "flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                  isRtl ? "text-right" : ""
                )}
                placeholder={searchPlaceholder}
              />
              {isRtl && <Search className="ml-2 h-5 w-5 shrink-0 opacity-50" />}
            </div>
            <ScrollArea className="h-[350px] overflow-y-auto">
              <Command.List className="p-1 overflow-hidden">
                {filteredOptions.length === 0 ? (
                  <Command.Empty className="p-4 text-center text-sm text-muted-foreground">
                    {isRtl ? "لا توجد نتائج." : "No results found."}
                  </Command.Empty>
                ) : (
                  filteredOptions.map((option) => (
                    <Command.Item
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        value === option.value ? "bg-accent text-accent-foreground" : "",
                        isRtl ? "flex-row-reverse" : ""
                      )}
                    >
                      {option.flag && <span className="inline-block w-6 text-base">{option.flag}</span>}
                      <span className="truncate">{isRtl ? option.labelAr || option.label : option.label}</span>
                    </Command.Item>
                  ))
                )}
              </Command.List>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
