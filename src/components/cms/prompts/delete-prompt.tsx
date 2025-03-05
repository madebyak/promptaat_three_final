"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Delete prompt API function
async function deletePrompt(id: string) {
  const response = await fetch(`/api/cms/prompts/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete prompt");
  }
  
  return response.json();
}

type DeletePromptProps = {
  promptId: string
  promptTitle: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

function DeletePrompt({ 
  promptId, 
  promptTitle,
  trigger,
  onSuccess 
}: DeletePromptProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  // Delete prompt mutation
  const { mutate, isPending } = useMutation({
    mutationFn: () => deletePrompt(promptId),
    onSuccess: () => {
      toast.success("Prompt deleted successfully");
      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete prompt");
    },
  });
  
  const handleDelete = () => {
    mutate();
  };
  
  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setOpen(true)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the prompt <span className="font-medium">{promptTitle}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DeletePrompt;
