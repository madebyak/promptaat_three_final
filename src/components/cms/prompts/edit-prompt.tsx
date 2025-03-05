"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import PromptForm from "./prompt-form";
import { PromptFormValues } from "./prompt-form";
import { Spinner } from "@/components/ui/spinner";

type Prompt = PromptFormValues & {
  id: string
  createdAt: string
  updatedAt: string
}

// Fetch prompt API function
async function getPrompt(id: string): Promise<{ prompt: Prompt }> {
  const response = await fetch(`/api/cms/prompts/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch prompt");
  }
  
  return response.json();
}

// Update prompt API function
async function updatePrompt(data: Prompt) {
  const { id, createdAt, updatedAt, ...rest } = data;
  
  const response = await fetch(`/api/cms/prompts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update prompt");
  }
  
  return response.json();
}

type EditPromptProps = {
  promptId: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

function EditPrompt({ 
  promptId, 
  trigger,
  onSuccess 
}: EditPromptProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Fetch prompt data
  const { data, isLoading, error } = useQuery({
    queryKey: ["prompt", promptId],
    queryFn: () => getPrompt(promptId),
    enabled: open, // Only fetch when dialog is open
  });
  
  // Update prompt mutation
  const { mutate, isPending } = useMutation({
    mutationFn: updatePrompt,
    onSuccess: () => {
      toast.success("Prompt updated successfully");
      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update prompt");
    },
  });
  
  const handleSubmit = (formData: PromptFormValues) => {
    mutate({
      id: promptId,
      createdAt: data?.prompt.createdAt || "",
      updatedAt: data?.prompt.updatedAt || "",
      ...formData,
    });
  };
  
  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Make changes to the prompt details below.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Failed to load prompt data. Please try again.
            </div>
          ) : data ? (
            <PromptForm 
              initialData={data.prompt} 
              onSubmit={handleSubmit} 
              isSubmitting={isPending} 
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditPrompt
