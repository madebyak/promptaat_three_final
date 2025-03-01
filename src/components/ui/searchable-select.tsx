'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = React.useMemo(() => {
    const searchTerm = search.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm) ||
      (option.labelAr && option.labelAr.includes(search))
    );
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
        type="button"
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isRtl ? "text-right" : "text-left"
        )}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2">
            {selectedOption.flag && <span>{selectedOption.flag}</span>}
            <span>{isRtl ? selectedOption.labelAr || selectedOption.label : selectedOption.label}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden">
          <Command className="w-full" shouldFilter={false}>
            <div className={cn(
              "flex items-center border-b px-3",
              isRtl ? "flex-row-reverse" : ""
            )}>
              {!isRtl && <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />}
              <Command.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                className={cn(
                  "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                  isRtl ? "text-right" : ""
                )}
                placeholder={searchPlaceholder}
              />
              {isRtl && <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
            </div>
            <ScrollArea className="h-[300px] overflow-y-auto">
              <Command.List className="p-1">
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
                        "flex items-center gap-2 rounded-sm px-3 py-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        value === option.value ? "bg-accent text-accent-foreground" : "",
                        isRtl ? "flex-row-reverse" : ""
                      )}
                    >
                      {option.flag && <span>{option.flag}</span>}
                      <span>{isRtl ? option.labelAr || option.label : option.label}</span>
                    </Command.Item>
                  ))
                )}
              </Command.List>
            </ScrollArea>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
