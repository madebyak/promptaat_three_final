"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { PlusCircle } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

interface CreateCatalogButtonProps {
  className?: string
}

export function CreateCatalogButton({ className }: CreateCatalogButtonProps) {
  const t = useTranslations("Catalogs")
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateCatalog = async () => {
    if (!name.trim()) {
      toast({
        title: t("error"),
        description: t("nameRequired", { defaultValue: "Catalog name is required" }),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/catalogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name.trim(),
          description: description.trim() || undefined
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create catalog")
      }

      toast({
        title: t("success"),
        description: t("catalogCreated", { defaultValue: "Catalog created successfully" }),
      })

      setName("")
      setDescription("")
      setOpen(false)
      router.refresh() // Refresh the page to show the new catalog
    } catch (err) {
      console.error("Create catalog error:", err)
      toast({
        title: t("error"),
        description: t("createFailed", { defaultValue: "Failed to create catalog" }),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("createCatalog", { defaultValue: "Create Catalog" })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createCatalog", { defaultValue: "Create Catalog" })}</DialogTitle>
          <DialogDescription>
            {t("createCatalogDescription", { defaultValue: "Create a new catalog to organize your bookmarked prompts." })}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("catalogName", { defaultValue: "Catalog Name" })}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("catalogNamePlaceholder", { defaultValue: "Enter catalog name" })}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t("description", { defaultValue: "Description (optional)" })}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder", { defaultValue: "Enter catalog description" })}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={handleCreateCatalog} disabled={isLoading}>
            {isLoading ? t("creating", { defaultValue: "Creating..." }) : t("create", { defaultValue: "Create" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
