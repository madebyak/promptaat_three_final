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
        throw new Error("Failed to create category")
      }

      // Use success message from our translations
      toast.success("Category created successfully")
      onSuccess?.()
      setOpen(false)
    } catch (error) {
      console.error("Error creating category:", error)
      // Use error message from our translations
      toast.error("Failed to create category")
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <CategoryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  )
}

export default CreateCategory