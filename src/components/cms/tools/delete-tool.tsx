"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTool } from "@/lib/api/cms/tools";

// Props for the DeleteTool component
interface DeleteToolProps {
  id: string;
  name: string;
  promptCount: number;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  iconOnly?: boolean;
}

export default function DeleteTool({
  id,
  name,
  promptCount,
  onSuccess,
  buttonVariant = "ghost",
  buttonSize = "icon",
  iconOnly = true,
}: DeleteToolProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for deleting a tool
  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteTool(id),
    onSuccess: () => {
      toast.success("Tool deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["cms-tools"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete tool");
    },
  });

  // Handle delete confirmation
  const handleDelete = () => {
    mutate();
  };

  // Check if tool can be deleted
  const canDelete = promptCount === 0;

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={buttonVariant}
        size={buttonSize}
        title="Delete Tool"
        disabled={!canDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        {!iconOnly && <span className="ml-2">Delete</span>}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {canDelete ? (
                <>
                  This will permanently delete the tool <strong>{name}</strong>.
                  This action cannot be undone.
                </>
              ) : (
                <>
                  The tool <strong>{name}</strong> cannot be deleted because it is 
                  associated with {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}.
                  <br /><br />
                  You must remove all associations before deleting this tool.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            {canDelete && (
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 