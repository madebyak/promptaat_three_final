"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface RemoveFromCatalogButtonProps {
  catalogId: string
  promptId: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
  className?: string
  translations?: {
    remove?: string
    confirmRemove?: string
    confirmRemoveDescription?: string
    cancel?: string
    confirm?: string
  }
  onRemoveSuccess?: () => void
}

export function RemoveFromCatalogButton({
  catalogId,
  promptId,
  buttonVariant = "ghost",
  buttonSize = "icon",
  className,
  translations = {
    remove: "Remove from catalog",
    confirmRemove: "Remove prompt",
    confirmRemoveDescription: "Are you sure you want to remove this prompt from the catalog?",
    cancel: "Cancel",
    confirm: "Remove",
  },
  onRemoveSuccess,
}: RemoveFromCatalogButtonProps) {
  const [open, setOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRemove = async () => {
    try {
      setIsRemoving(true)
      
      const response = await fetch(`/api/catalogs/${catalogId}/prompts/${promptId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove prompt from catalog")
      }

      toast({
        title: "Success",
        description: "Prompt removed from catalog successfully",
      })
      
      setOpen(false)
      
      // Call the onRemoveSuccess callback if provided
      if (onRemoveSuccess) {
        onRemoveSuccess()
      } else {
        // Otherwise, refresh the page
        router.refresh()
      }
    } catch (error) {
      console.error("Error removing prompt from catalog:", error)
      toast({
        title: "Error",
        description: "Failed to remove prompt from catalog",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{translations.remove}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{translations.confirmRemove}</AlertDialogTitle>
          <AlertDialogDescription>
            {translations.confirmRemoveDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>
            {translations.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : translations.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
