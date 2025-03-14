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
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CategoryForm, { CategoryFormValues } from "./category-form";
import { updateCategory, deleteCategory } from "@/lib/api/cms/categories";
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
import { formatDate } from "@/lib/utils";

type CategoryData = {
  id: string
  nameEn: string
  nameAr: string
  iconName: string
  parentId: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count: {
    children: number
    subcategories: number
    prompts: number
    promptCategories: number
  }
}

type EditCategoryProps = {
  category: CategoryData;
  onSuccess?: () => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showDeleteButton?: boolean;
}

function EditCategory({
  category,
  onSuccess,
  buttonVariant = "ghost",
  buttonSize = "sm",
  showDeleteButton = true,
}: EditCategoryProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for updating a category
  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: CategoryFormValues) => updateCategory(category.id, data),
    onSuccess: () => {
      // Use success message from our translations
      toast.success("Category updated successfully", {
        description: `${category.nameEn} has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["cms-categories"] });
      queryClient.invalidateQueries({ queryKey: ["cms-categories-for-form"] });
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      // Use error message from our translations
      toast.error("Failed to update category", {
        description: error.message || "There was an error updating the category. Please try again.",
      });
    },
  });

  // Mutation for deleting a category
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      // Use success message from our translations
      toast.success("Category deleted successfully", {
        description: `${category.nameEn} has been permanently removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["cms-categories"] });
      queryClient.invalidateQueries({ queryKey: ["cms-categories-for-form"] });
      setDeleteDialogOpen(false);
      setOpen(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      // Use error message from our translations
      toast.error("Failed to delete category", {
        description: error.message || "There was an error deleting the category. Please try again.",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: CategoryFormValues) => {
    updateMutate(data);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    console.log('Delete category triggered for:', category.id);
    deleteMutate();
  };

  // Check if category has prompts or subcategories
  const hasChildren = (category._count?.prompts || 0) > 0 || (category._count?.subcategories || 0) > 0;

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={buttonVariant}
        size={buttonSize}
        title="Edit Category"
      >
        <Pencil className="h-4 w-4" />
        {buttonSize !== "icon" && <span className="ml-2">Edit</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for this category. Changes will be reflected throughout the application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <CategoryForm 
              initialData={category} 
              onSubmit={handleSubmit} 
              isSubmitting={isUpdatePending} 
            />
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {showDeleteButton && (
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isUpdatePending || isDeletePending}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </Button>
              )}
            </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren ? (
                <div className="text-destructive font-medium">
                  Warning: This category contains {category._count?.prompts || 0} prompts and {category._count?.subcategories || 0} subcategories. 
                  Deleting it will also delete all associated content.
                </div>
              ) : (
                "This action cannot be undone. The category will be permanently deleted from the system."
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Category: {category.nameEn}</p>
                <p>Created: {formatDate(category.createdAt)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeletePending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default EditCategory;