"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the form schema with validation
const toolSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  iconUrl: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
});

// Infer the type from the schema
type ToolFormValues = z.infer<typeof toolSchema>;

// Props for the form component
interface ToolFormProps {
  initialData?: {
    id?: string;
    name: string;
    iconUrl?: string;
  };
  onSubmit: (data: ToolFormValues) => void;
  isSubmitting: boolean;
}

// Form section component for grouping related fields
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function ToolForm({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}: ToolFormProps) {
  // Initialize the form with default values or data for editing
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: initialData || {
      name: "",
      iconUrl: "",
    },
  });

  // Watch form values for preview
  const watchName = form.watch("name");
  const watchIconUrl = form.watch("iconUrl");

  // Event handlers
  const handleSubmit = (values: ToolFormValues) => {
    onSubmit(values);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormSection title="Tool Information">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter tool name" 
                        {...field} 
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      The name of the AI tool (e.g., "ChatGPT", "DALL-E", "Midjourney")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Icon URL Field */}
              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/icon.png" 
                        {...field} 
                        value={field.value || ""}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the tool's icon image. Use a square image for best results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Form actions */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? 'Update Tool' : 'Create Tool'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      {/* Preview Section */}
      <div>
        <h3 className="text-md font-medium mb-4">Preview</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {watchIconUrl ? (
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border">
                    <img 
                      src={watchIconUrl} 
                      alt={watchName || "Tool icon"} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=Error";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No Icon</span>
                  </div>
                )}
                <span className="font-medium">{watchName || "Tool Name"}</span>
              </div>
              
              {watchIconUrl && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <a 
                    href={watchIconUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="truncate hover:underline"
                  >
                    {watchIconUrl}
                  </a>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                This is how the tool will appear in the tools listing.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 