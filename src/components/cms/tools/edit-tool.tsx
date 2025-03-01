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
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import ToolForm from "./tool-form";
import { updateTool } from "@/lib/api/cms/tools";

// Tool data interface
interface ToolData {
  id: string;
  name: string;
  iconUrl?: string;
}

// Props for the EditTool component
interface EditToolProps {
  tool: ToolData;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  iconOnly?: boolean;
}

export default function EditTool({
  tool,
  onSuccess,
  buttonVariant = "ghost",
  buttonSize = "icon",
  iconOnly = true,
}: EditToolProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for updating a tool
  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => updateTool(tool.id, data),
    onSuccess: () => {
      toast.success("Tool updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cms-tools"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update tool");
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
        title="Edit Tool"
      >
        <Pencil className="h-4 w-4" />
        {!iconOnly && <span className="ml-2">Edit</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
            <DialogDescription>
              Update the details of this AI tool.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ToolForm 
              initialData={tool} 
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