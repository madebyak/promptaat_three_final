"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import CategoryForm, { CategoryFormValues } from "./category-form"
import { toast } from "sonner"

type CreateCategoryProps = {
  onSuccess?: () => void
}

function CreateCategory({ onSuccess }: CreateCategoryProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/cms/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to create category")
      }

      await response.json() // Get the result but we don't need to use it
      
      // Use success message from our translations
      toast.success("Category created successfully", {
        description: `${data.nameEn} has been added to your categories.`,
      })
      onSuccess?.()
      setOpen(false)
    } catch (error: unknown) {
      console.error("Error creating category:", error)
      // Use error message from our translations
      toast.error("Failed to create category", {
        description: error instanceof Error ? error.message : "There was an error creating the category. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CategoryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCategory