"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { FolderPlus, Check, Loader2 } from "lucide-react"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useToast } from "@/components/ui/use-toast"
import { CreateCatalogButton } from "./create-catalog-button"

interface Catalog {
  id: string
  name: string
  _count?: {
    prompts: number
  }
}

interface AddToCatalogButtonProps {
  promptId: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function AddToCatalogButton({ 
  promptId, 
  className,
  variant = "outline",
  size = "sm"
}: AddToCatalogButtonProps) {
  const t = useTranslations("Catalogs")
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<Set<string>>(new Set())
  const [savingCatalogIds, setSavingCatalogIds] = useState<Set<string>>(new Set())

  // Fetch catalogs when dialog opens
  useEffect(() => {
    const fetchCatalogs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/catalogs")
        if (!response.ok) {
          throw new Error("Failed to fetch catalogs")
        }
        const data = await response.json()
        setCatalogs(data)
        
        // Check which catalogs already contain this prompt
        const catalogPromises = data.map(async (catalog: Catalog) => {
          try {
            const promptsResponse = await fetch(`/api/catalogs/${catalog.id}/prompts/${promptId}`)
            if (promptsResponse.ok) {
              const result = await promptsResponse.json()
              if (result.inCatalog) {
                setSelectedCatalogIds(prev => new Set([...prev, catalog.id]))
              }
            }
          } catch (err) {
            console.error(`Error checking catalog ${catalog.id}:`, err)
          }
        })
        
        await Promise.all(catalogPromises)
      } catch (err) {
        console.error("Fetch catalogs error:", err)
        toast({
          title: t("error"),
          description: t("fetchFailed", { defaultValue: "Failed to fetch catalogs" }),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (open) {
      fetchCatalogs()
    }
  }, [open, promptId, t, toast])

  const toggleCatalog = async (catalogId: string) => {
    const isSelected = selectedCatalogIds.has(catalogId)
    
    // Add to saving set to show loading state
    setSavingCatalogIds(prev => new Set([...prev, catalogId]))
    
    try {
      if (isSelected) {
        // Remove from catalog
        const response = await fetch(`/api/catalogs/${catalogId}/prompts/${promptId}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          throw new Error("Failed to remove from catalog")
        }
        
        setSelectedCatalogIds(prev => {
          const next = new Set([...prev])
          next.delete(catalogId)
          return next
        })
        
        toast({
          title: t("success"),
          description: t("removedFromCatalog", { defaultValue: "Removed from catalog" }),
        })
      } else {
        // Add to catalog
        const response = await fetch(`/api/catalogs/${catalogId}/prompts/${promptId}`, {
          method: "POST",
        })
        
        if (!response.ok) {
          throw new Error("Failed to add to catalog")
        }
        
        setSelectedCatalogIds(prev => new Set([...prev, catalogId]))
        
        toast({
          title: t("success"),
          description: t("addedToCatalog", { defaultValue: "Added to catalog" }),
        })
      }
    } catch (err) {
      console.error("Toggle catalog error:", err)
      toast({
        title: t("error"),
        description: isSelected 
          ? t("removeFromCatalogFailed", { defaultValue: "Failed to remove from catalog" })
          : t("addToCatalogFailed", { defaultValue: "Failed to add to catalog" }),
        variant: "destructive",
      })
    } finally {
      // Remove from saving set
      setSavingCatalogIds(prev => {
        const next = new Set([...prev])
        next.delete(catalogId)
        return next
      })
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Refresh the page to update the UI
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FolderPlus className="h-4 w-4 mr-2" />
          {t("addToCatalog", { defaultValue: "Add to Catalog" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addToCatalog", { defaultValue: "Add to Catalog" })}</DialogTitle>
          <DialogDescription>
            {t("addToCatalogDescription", { defaultValue: "Add this prompt to one or more of your catalogs." })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {catalogs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    {t("noCatalogs", { defaultValue: "You don't have any catalogs yet." })}
                  </p>
                  <CreateCatalogButton />
                </div>
              ) : (
                <Command>
                  <CommandInput 
                    placeholder={t("searchCatalogs", { defaultValue: "Search catalogs..." })} 
                  />
                  <CommandList>
                    <CommandEmpty>
                      {t("noResults", { defaultValue: "No catalogs found." })}
                    </CommandEmpty>
                    <CommandGroup>
                      {catalogs.map((catalog) => (
                        <CommandItem
                          key={catalog.id}
                          onSelect={() => toggleCatalog(catalog.id)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{catalog.name}</span>
                          <span className="flex items-center">
                            {savingCatalogIds.has(catalog.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selectedCatalogIds.has(catalog.id) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : null}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <CreateCatalogButton />
          <Button onClick={handleClose}>
            {t("done", { defaultValue: "Done" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
