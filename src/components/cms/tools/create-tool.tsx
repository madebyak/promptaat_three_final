"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import ToolForm from "./tool-form";
import { createTool } from "@/lib/api/cms/tools";

// Props for the CreateTool component
interface CreateToolProps {
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonText?: string;
  fullWidth?: boolean;
}

export default function CreateTool({
  onSuccess,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Add Tool",
  fullWidth = false,
}: CreateToolProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for creating a tool
  const { mutate, isPending } = useMutation({
    mutationFn: createTool,
    onSuccess: () => {
      toast.success("Tool created successfully");
      queryClient.invalidateQueries({ queryKey: ["cms-tools"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create tool");
    },
  });

  // Handle form submission
  const handleSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={buttonVariant}
        size={buttonSize}
        className={fullWidth ? "w-full" : ""}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Tool</DialogTitle>
            <DialogDescription>
              Add a new AI tool that can be associated with prompts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ToolForm 
              initialData={{ 
                name: "", 
                iconUrl: "" 
              }} 
              onSubmit={handleSubmit} 
              isSubmitting={isPending} 
            />
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              type="button"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 