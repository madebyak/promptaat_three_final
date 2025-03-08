"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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

// Create fallback translations to use when the real translations fail
const FALLBACK_TRANSLATIONS: Record<string, string> = {
  "addToCatalog": "Add to Catalog",
  "addToCatalogDescription": "Add this prompt to one or more of your catalogs.",
  "searchCatalogs": "Search catalogs...",
  "noCatalogs": "You don't have any catalogs yet.",
  "noResults": "No catalogs found.",
  "createCatalog": "Create Catalog",
  "yourCatalogs": "Your Catalogs",
  "cancel": "Cancel",
  "done": "Done",
  "error": "Error",
  "success": "Success",
  "fetchFailed": "Failed to fetch catalogs",
  "addedToCatalog": "Added to catalog",
  "removedFromCatalog": "Removed from catalog",
  "addToCatalogFailed": "Failed to add to catalog",
  "removeFromCatalogFailed": "Failed to remove from catalog"
};

export function AddToCatalogButton({ 
  promptId, 
  className,
  variant = "outline",
  size = "sm"
}: AddToCatalogButtonProps) {
  // Use a safe approach for translations
  // We'll use the fallback translations directly without trying to use useTranslations
  // This avoids the React Hook conditional call error
  
  // Create a safe translation function that uses fallbacks
  // Wrap in useCallback to prevent unnecessary re-renders
  const t = useCallback((key: string, options?: { defaultValue?: string }): string => {
    // Just use fallback translations directly
    return options?.defaultValue || FALLBACK_TRANSLATIONS[key] || key;
  }, []);
  
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
            // Add error handling for network requests
            if (!catalog || !catalog.id) {
              console.error('Invalid catalog data:', catalog);
              return;
            }
            
            const promptsResponse = await fetch(`/api/catalogs/${catalog.id}/prompts/${promptId}`)
            if (promptsResponse.ok) {
              const result = await promptsResponse.json()
              if (result.inCatalog) {
                setSelectedCatalogIds(prev => new Set([...prev, catalog.id]))
              }
            }
          } catch (err) {
            console.error(`Error checking catalog ${catalog?.id || 'unknown'}:`, err)
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
                  <CreateCatalogButton className="w-full" />
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
          <CreateCatalogButton variant="outline" />
          <Button onClick={handleClose}>
            {t("done", { defaultValue: "Done" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
