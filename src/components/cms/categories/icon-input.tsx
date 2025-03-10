"use client";

import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { ExternalLink } from "lucide-react";

interface IconInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export default function IconInput({ 
  value, 
  onChange, 
  label = "Icon Name",
  error
}: IconInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        <FormControl>
          <Input
            value={value}
            onChange={handleInputChange}
            placeholder="Enter Lucide icon name"
            className="w-full"
          />
        </FormControl>
        <div className="flex items-start text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            Enter the exact icon name from Lucide (e.g., &quot;building&quot;, &quot;graduationCap&quot;).
            <a 
              href="https://lucide.dev/icons/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center ml-1 text-primary hover:underline"
            >
              View all icons <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
          </span>
        </div>
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
} 