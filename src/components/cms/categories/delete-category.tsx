"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "./categories-management";

type DeleteCategoryProps = {
  category: Category;
  onSuccess?: () => void;
};

function DeleteCategory({ category, onSuccess }: DeleteCategoryProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/cms/categories?id=${category.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete category");
      }

      // Use success message from our translations
      toast.success("Category deleted successfully", {
        description: `${category.nameEn} has been permanently removed.`,
      });
      
      // Wait a moment before triggering the success callback to ensure UI updates properly
      setTimeout(() => {
        onSuccess?.();
      }, 300);
    } catch (error: unknown) {
      console.error("Error deleting category:", error);
      // Use error message from our translations
      toast.error("Failed to delete category", {
        description: error instanceof Error ? error.message : "There was an error deleting the category. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{category.nameEn}&rdquo;? 
            {category.parentId === null ? (
              <div className="mt-2 text-destructive font-medium">
                Warning: Deleting this category will also delete all its subcategories!
              </div>
            ) : null}
            <div className="mt-2">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategory;