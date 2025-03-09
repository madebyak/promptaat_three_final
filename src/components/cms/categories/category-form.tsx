"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categoryIcons } from "@/lib/constants/category-icons"
// We're not using toast directly in this component, but it's used in parent components
// that call the onSubmit function with toast notifications
import IconInput from "./icon-input"
// Removed dependency on useTranslations from next-intl

const categorySchema = z.object({
  id: z.string().optional(),
  nameEn: z
    .string()
    .min(3, {
      message: "Name must be at least 3 characters.",
    })
    .max(50, {
      message: "English name must not be longer than 50 characters.",
    }),
  nameAr: z
    .string()
    .min(3, {
      message: "Arabic name must be at least 3 characters.",
    })
    .max(50, {
      message: "Arabic name must not be longer than 50 characters.",
    }),
  iconName: z.string(),
  parentId: z.string().nullable(),
  sortOrder: z.number().int().default(0),
})

type CategoryFormValues = z.infer<typeof categorySchema>

type CategoryFormProps = {
  initialData?: CategoryFormValues
  onSubmit: (data: CategoryFormValues) => void
  isSubmitting?: boolean
}

type Category = {
  id: string
  nameEn: string
  nameAr: string
  parentId: string | null
  order: number
  iconName: string
}

type FormSectionProps = {
  title: string
  children: React.ReactNode
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/cms/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const data = await response.json()
  return data.data || []
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-md font-medium">{title}</h3>
        <Separator className="flex-1 ml-3" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function CategoryForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: CategoryFormProps) {
  const [nextAvailableSortOrder, setNextAvailableSortOrder] = useState<number | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      id: "",
      nameEn: "",
      nameAr: "",
      iconName: "",
      parentId: null,
      sortOrder: 0,
    },
  })

  const watchNameEn = form.watch("nameEn")
  const watchIconName = form.watch("iconName")
  const watchParentId = form.watch("parentId")

  const { data: categories = [], error: categoriesError } = useQuery({
    queryKey: ["cms-categories-for-form"],
    queryFn: fetchCategories,
  })

  const filteredCategories = categories.filter(
    (category: Category) => category.id !== initialData?.id
  ) || []

  useEffect(() => {
    if (categories.length > 0 && !initialData?.sortOrder) {
      const parentId = form.getValues().parentId
      const categoriesWithSameParent = categories.filter(
        (cat: Category) => cat.parentId === parentId
      )

      if (categoriesWithSameParent.length > 0) {
        const maxSortOrder = Math.max(
          ...categoriesWithSameParent.map((cat: Category) => cat.order)
        )
        setNextAvailableSortOrder(maxSortOrder + 1)
      } else {
        setNextAvailableSortOrder(0)
      }
    }
  }, [categories, form, initialData?.sortOrder])

  useEffect(() => {
    if (watchParentId !== undefined && !initialData?.id) {
      const categoriesWithSameParent = categories.filter(
        (cat: Category) => cat.parentId === watchParentId
      )

      if (categoriesWithSameParent.length > 0) {
        const maxSortOrder = Math.max(
          ...categoriesWithSameParent.map((cat: Category) => cat.order)
        )
        setNextAvailableSortOrder(maxSortOrder + 1)
      } else {
        setNextAvailableSortOrder(0)
      }
    }
  }, [watchParentId, categories, initialData?.id])

  const handleSubmit = (values: CategoryFormValues) => {
    if (values.parentId === "" || values.parentId === "none") {
      values.parentId = null
    }

    if (values.sortOrder === undefined && nextAvailableSortOrder !== null) {
      values.sortOrder = nextAvailableSortOrder
    }

    onSubmit(values)
  }

  const getParentName = () => {
    if (!watchParentId) return null
    const parent = categories.find((cat: Category) => cat.id === watchParentId)
    return parent ? parent.nameEn : null
  }

  // Using hardcoded translations instead of useTranslations
  // This ensures the component works without relying on the NextIntlClientProvider
  const t = (key: string) => {
    const translations: Record<string, string> = {
      // Form labels
      "form.name.en": "Name (English)",
      "form.name.ar": "Name (Arabic)",
      "form.icon": "Icon",
      "form.parent": "Parent Category",
      "form.parent.none": "None (Top Level)",
      "form.parent.description": "Select a parent category or leave empty for top-level",
      // Buttons
      "button.save": "Save Changes",
      "button.saving": "Saving...",
      "button.create": "Create Category",
      "button.creating": "Creating...",
      // Preview
      "preview.title": "Preview",
      "preview.description": "This is how the category will appear in the UI",
      // Success messages
      "success.created": "Category created successfully",
      "success.updated": "Category updated successfully",
      // Error messages
      "error.create": "Failed to create category",
      "error.update": "Failed to update category",
      "error.fetch": "Failed to fetch categories"
    }
    return translations[key] || key
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {categoriesError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading categories. Some features may not work correctly.
                </AlertDescription>
              </Alert>
            )}

            <FormSection title="Basic Information">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.nameEn")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name in English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.nameAr")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name in Arabic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.icon")}</FormLabel>
                    <FormControl>
                      <IconInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Category Structure">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.parent")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {filteredCategories.map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional. Select a parent category to create a subcategory.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Category"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Preview</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">English Name:</span>
                <p className="font-medium">{watchNameEn || "Not set"}</p>
              </div>

              {watchIconName && (
                <div>
                  <span className="text-sm text-muted-foreground">Icon:</span>
                  <div className="mt-1">
                    {categoryIcons[watchIconName]?.icon}
                  </div>
                </div>
              )}

              {watchParentId && watchParentId !== "none" && (
                <div>
                  <span className="text-sm text-muted-foreground">Parent:</span>
                  <p className="font-medium">{getParentName()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export type { CategoryFormValues, CategoryFormProps, Category }
export default CategoryForm