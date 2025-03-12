"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Folder, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface Catalog {
  id: string
  name: string
  description?: string | null
  _count?: {
    prompts?: number
  }
  // For backward compatibility with older API responses
  promptCount?: number
}

interface CatalogListProps {
  catalogs: Catalog[]
}

export function CatalogList({ catalogs }: CatalogListProps) {
  const t = useTranslations("Catalogs")
  const router = useRouter()
  const { toast } = useToast()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEditClick = (catalog: Catalog) => {
    setSelectedCatalog(catalog)
    setNewName(catalog.name)
    setNewDescription(catalog.description || "")
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (catalog: Catalog) => {
    setSelectedCatalog(catalog)
    setDeleteDialogOpen(true)
  }

  const handleUpdateCatalog = async () => {
    if (!selectedCatalog) return
    if (!newName.trim()) {
      toast({
        title: t("error"),
        description: t("nameRequired", { defaultValue: "Catalog name is required" }),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/catalogs/${selectedCatalog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: newName.trim(),
          description: newDescription.trim() || undefined
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update catalog")
      }

      toast({
        title: t("success"),
        description: t("catalogUpdated", { defaultValue: "Catalog updated successfully" }),
      })

      setEditDialogOpen(false)
      router.refresh() // Refresh the page to show the updated catalog
    } catch (err) {
      console.error("Update catalog error:", err)
      toast({
        title: t("error"),
        description: t("updateFailed", { defaultValue: "Failed to update catalog" }),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCatalog = async () => {
    if (!selectedCatalog) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/catalogs/${selectedCatalog.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete catalog")
      }

      toast({
        title: t("success"),
        description: t("catalogDeleted", { defaultValue: "Catalog deleted successfully" }),
      })

      setDeleteDialogOpen(false)
      router.refresh() // Refresh the page to show the updated catalog list
    } catch (err) {
      console.error("Delete catalog error:", err)
      toast({
        title: t("error"),
        description: t("deleteFailed", { defaultValue: "Failed to delete catalog" }),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (catalogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t("noCatalogs", { defaultValue: "No Catalogs" })}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("noCatalogsDescription", { defaultValue: "You haven't created any catalogs yet." })}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogs.map((catalog) => (
          <Card key={catalog.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">{catalog.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("openMenu", { defaultValue: "Open menu" })}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditClick(catalog)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("edit", { defaultValue: "Edit" })}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick(catalog)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete", { defaultValue: "Delete" })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {catalog.description && (
                <p className="text-sm text-muted-foreground mb-2">{catalog.description}</p>
              )}
              <CardDescription>
                {t("promptCount", { 
                  count: catalog._count?.prompts || catalog.promptCount || 0,
                  defaultValue: "{{count}} prompts", 
                })}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/my-prompts/catalogs/${catalog.id}`}>
                  {t("viewCatalog", { defaultValue: "View Catalog" })}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Catalog Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editCatalog", { defaultValue: "Edit Catalog" })}</DialogTitle>
            <DialogDescription>
              {t("editCatalogDescription", { defaultValue: "Update the name of your catalog." })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("catalogName", { defaultValue: "Catalog Name" })}</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("catalogNamePlaceholder", { defaultValue: "Enter catalog name" })}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t("description", { defaultValue: "Description (optional)" })}</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder", { defaultValue: "Enter catalog description" })}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleUpdateCatalog} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("updating", { defaultValue: "Updating..." })}
                </>
              ) : (
                t("update", { defaultValue: "Update" })
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Catalog Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteCatalog", { defaultValue: "Delete Catalog" })}</DialogTitle>
            <DialogDescription>
              {t("deleteCatalogDescription", { 
                defaultValue: "Are you sure you want to delete this catalog? This action cannot be undone." 
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
              {t("cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCatalog} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting", { defaultValue: "Deleting..." })}
                </>
              ) : (
                t("delete", { defaultValue: "Delete" })
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
