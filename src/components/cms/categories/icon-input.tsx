"use client";

import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import IconPicker from "./icon-picker";

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
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <IconPicker 
          value={value} 
          onChange={onChange} 
          error={error}
        />
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
} 