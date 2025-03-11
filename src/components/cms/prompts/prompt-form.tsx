"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

import { X } from "lucide-react";

type Category = {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId: string | null;
};

type Tool = {
  id: string;
  name: string;
};

// Form schema
const promptFormSchema = z.object({
  titleEn: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  titleAr: z.string().min(3, {
    message: "Arabic title must be at least 3 characters.",
  }),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  instructionEn: z.string().optional(),
  instructionAr: z.string().optional(),
  promptTextEn: z.string().min(10, {
    message: "Prompt text must be at least 10 characters.",
  }),
  promptTextAr: z.string().min(10, {
    message: "Arabic prompt text must be at least 10 characters.",
  }),
  isPro: z.boolean().default(false),
  copyCount: z.number().int().nonnegative().optional(),
  categoryId: z.string({
    required_error: "Please select a category.",
  }),
  subcategoryId: z.string({
    required_error: "Please select a subcategory.",
  }),
  keywords: z.array(z.string()).optional(),
  toolIds: z.array(z.string()).optional(),
});

type PromptFormValues = z.infer<typeof promptFormSchema>;

// Fetch categories
async function getCategories(): Promise<{ data: Category[] }> {
  const response = await fetch("/api/cms/categories?simplified=true");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

// Fetch tools
async function getTools(): Promise<{ data: Tool[] }> {
  const response = await fetch("/api/cms/tools");

  if (!response.ok) {
    throw new Error("Failed to fetch tools");
  }

  return response.json();
}

type PromptFormProps = {
  initialData?: PromptFormValues;
  onSubmit: (data: PromptFormValues) => void;
  isSubmitting?: boolean;
};

function PromptForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: PromptFormProps) {
  const [keywords, setKeywords] = useState<string[]>(
    initialData?.keywords || []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedTab, setSelectedTab] = useState("english");

  // Initialize the form
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: initialData || {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      instructionEn: "",
      instructionAr: "",
      promptTextEn: "",
      promptTextAr: "",
      isPro: false,
      copyCount: 0,
      categoryId: "",
      subcategoryId: "",
      keywords: [],
      toolIds: [],
    },
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch tools
  const {
    data: toolsData,
    isLoading: isToolsLoading,
  } = useQuery({
    queryKey: ["tools"],
    queryFn: getTools,
  });

  // Watch for changes in categoryId
  const selectedCategoryId = form.watch("categoryId");

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      form.setValue("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(newKeywords);
    form.setValue("keywords", newKeywords);
  };

  // Handle form submission
  const handleSubmit = (values: PromptFormValues) => {
    // Include keywords in the submission
    values.keywords = keywords;
    
    // Ensure categoryId is included
    if (!values.categoryId) {
      form.setError("categoryId", { message: "Category is required" });
      return;
    }
    
    onSubmit(values);
  };

  // When category changes, reset subcategory
  useEffect(() => {
    if (selectedCategoryId) {
      form.setValue("subcategoryId", "");
    }
  }, [selectedCategoryId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="english">English</TabsTrigger>
            <TabsTrigger value="arabic">Arabic</TabsTrigger>
          </TabsList>

          <TabsContent value="english" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter prompt title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The title of your prompt in English.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter prompt description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this prompt does.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter instructions for using this prompt"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions for how to use this prompt effectively.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promptTextEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the actual prompt text"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The actual text of the prompt that will be used.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="arabic" className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="titleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="أدخل عنوان القالب"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The title of your prompt in Arabic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصف القالب"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this prompt does in Arabic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل تعليمات استخدام هذا القالب"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions for how to use this prompt effectively in Arabic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promptTextAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Text (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل نص القالب"
                      className="min-h-[200px]"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The actual text of the prompt that will be used in Arabic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subcategoryId", "", { shouldValidate: true });
                    form.trigger("categoryId");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {isCategoriesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Spinner />
                      </div>
                    ) : (
                      categoriesData?.data
                        ?.filter((cat: Category) => !cat.parentId)
                        .map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nameEn}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategoryId && (
            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Subcategory</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.trigger("subcategoryId");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {categoriesData?.data
                        ?.filter((cat: Category) => cat.parentId === selectedCategoryId)
                        .map((subcategory: Category) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.nameEn}
                          </SelectItem>
                        ))}
                      {categoriesData?.data?.filter((cat: Category) => cat.parentId === selectedCategoryId).length === 0 && (
                        <div className="p-2 text-sm text-center text-muted-foreground">No subcategories available</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isPro"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Pro Prompt</FormLabel>
                  <FormDescription>
                    This prompt will only be available to Pro users.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="copyCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copy Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    value={field.value || 0}
                  />
                </FormControl>
                <FormDescription>
                  Number of times this prompt has been copied by users
                </FormDescription>
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="pt-6">
              <FormLabel>Keywords</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addKeyword}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {!isToolsLoading && toolsData?.data && toolsData.data.length > 0 && (
            <FormField
              control={form.control}
              name="toolIds"
              render={() => (
                <FormItem>
                  <FormLabel>Required Tools</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {toolsData.data.map((tool: Tool) => (
                      <FormField
                        key={tool.id}
                        control={form.control}
                        name="toolIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={tool.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={(field.value || []).includes(
                                    tool.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    const currentTools = field.value || [];
                                    const updatedTools = checked
                                      ? [...currentTools, tool.id]
                                      : currentTools.filter(
                                          (id: string) => id !== tool.id
                                        );
                                    field.onChange(updatedTools);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {tool.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Saving...
            </>
          ) : (
            "Save Prompt"
          )}
        </Button>
      </form>
    </Form>
  );
}

export type { PromptFormValues };
export default PromptForm;
