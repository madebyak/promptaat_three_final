"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"

interface EditCatalogButtonProps {
  catalogId: string
  catalogName: string
  catalogDescription?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
  translations?: {
    editCatalog?: string
    editYourCatalog?: string
    name?: string
    description?: string
    cancel?: string
    save?: string
  }
}

export function EditCatalogButton({
  catalogId,
  catalogName,
  catalogDescription = "",
  buttonVariant = "outline",
  buttonSize = "sm",
  className,
  translations = {
    editCatalog: "Edit Catalog",
    editYourCatalog: "Edit your catalog",
    name: "Name",
    description: "Description (optional)",
    cancel: "Cancel",
    save: "Save Changes",
  },
}: EditCatalogButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(catalogName)
  const [description, setDescription] = useState(catalogDescription)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Catalog name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/catalogs/${catalogId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update catalog")
      }

      toast({
        title: "Success",
        description: "Catalog updated successfully",
      })
      
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating catalog:", error)
      toast({
        title: "Error",
        description: "Failed to update catalog",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Pencil className="mr-2 h-4 w-4" />
          {translations.editCatalog}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{translations.editYourCatalog}</DialogTitle>
            <DialogDescription>
              Make changes to your catalog here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{translations.name}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Favorite Prompts"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{translations.description}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A collection of my favorite prompts"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              {translations.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : translations.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
