"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PromptForm from "./prompt-form";

// Define prompt data interface
interface PromptData {
  title: string;
  content: string;
  categoryIds: string[];
  toolId?: string;
  isPublished?: boolean;
  [key: string]: any; // For any additional fields
}

// Create prompt API function
async function createPrompt(data: PromptData) {
  const response = await fetch("/api/cms/prompts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create prompt");
  }
  
  return response.json();
}

export default function CreatePrompt({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Create prompt mutation
  const { mutate, isPending } = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      toast.success("Prompt created successfully");
      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create prompt");
    },
  });
  
  const handleSubmit = (data: PromptData) => {
    mutate(data);
  };
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Prompt
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new prompt.
            </DialogDescription>
          </DialogHeader>
          
          <PromptForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </DialogContent>
      </Dialog>
    </>
  );
}
