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
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import IconInput from "./icon-input"
import { useTranslations } from "next-intl"

export interface Category {
  id: string
  nameEn: string
  nameAr: string
  parentId: string | null
  order: number
}

const categorySchema = z.object({
  nameEn: z
    .string()
    .min(2, {
      message: "English name must be at least 2 characters.",
    })
    .max(50, {
      message: "English name must not be longer than 50 characters.",
    }),
  nameAr: z
    .string()
    .min(2, {
      message: "Arabic name must be at least 2 characters.",
    })
    .max(50, {
      message: "Arabic name must not be longer than 50 characters.",
    }),
  iconName: z.string().min(1, "Icon is required"),
  parentId: z.string().nullable(),
  sortOrder: z.coerce.number().int().optional(),
})

export interface CategoryFormValues {
  nameEn: string
  nameAr: string
  iconName: string
  parentId: string | null
  sortOrder: number
}

export interface CategoryFormProps {
  initialData?: {
    id?: string
    nameEn: string
    nameAr: string
    iconName: string
    parentId: string | null
    sortOrder: number
  }
  onSubmit: (data: CategoryFormValues) => void
  isSubmitting: boolean
}

async function fetchCategories() {
  const response = await fetch("/api/cms/categories")
  if (!response.ok) {
    throw new Error("Failed to fetch categories")
  }
  const data = await response.json()
  return data.data || []
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
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

export function CategoryForm({ initialData, onSubmit, isSubmitting }: CategoryFormProps) {
  const [nextAvailableSortOrder, setNextAvailableSortOrder] = useState<number | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
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

  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["cms-categories-for-form"],
    queryFn: fetchCategories,
  })

  const filteredCategories = categories.filter(
    (category: any) => category.id !== initialData?.id
  ) || []

  useEffect(() => {
    if (categories.length > 0 && !initialData?.sortOrder) {
      const parentId = form.getValues().parentId
      const categoriesWithSameParent = categories.filter(
        (cat: any) => cat.parentId === parentId
      )

      if (categoriesWithSameParent.length > 0) {
        const maxSortOrder = Math.max(
          ...categoriesWithSameParent.map((cat: any) => cat.sortOrder)
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
        (cat: any) => cat.parentId === watchParentId
      )

      if (categoriesWithSameParent.length > 0) {
        const maxSortOrder = Math.max(
          ...categoriesWithSameParent.map((cat: any) => cat.sortOrder)
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
    const parent = categories.find((cat: any) => cat.id === watchParentId)
    return parent ? parent.nameEn : null
  }

  const IconComponent = watchIconName ? categoryIcons[watchIconName] : null

  const t = useTranslations("Categories")

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
                        {filteredCategories.map((category: any) => (
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

              {IconComponent && (
                <div>
                  <span className="text-sm text-muted-foreground">Icon:</span>
                  <div className="mt-1">
                    <IconComponent className="h-5 w-5" />
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

export default CategoryForm;