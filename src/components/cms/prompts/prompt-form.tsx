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
async function getCategories() {
  const response = await fetch("/api/cms/categories?simplified=true");
  
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  return response.json();
}

// Fetch tools
async function getTools() {
  const response = await fetch("/api/cms/tools");
  
  if (!response.ok) {
    throw new Error("Failed to fetch tools");
  }
  
  return response.json();
}

interface PromptFormProps {
  initialData?: any;
  onSubmit: (data: PromptFormValues) => void;
  isSubmitting?: boolean;
}

export default function PromptForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: PromptFormProps) {
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || []);
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
      categoryId: "",
      subcategoryId: "",
      keywords: [],
      toolIds: [],
    },
  });
  
  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  
  // Fetch tools
  const { 
    data: toolsData, 
    isLoading: isToolsLoading 
  } = useQuery({
    queryKey: ["tools"],
    queryFn: getTools,
  });
  
  // Get subcategories based on selected category
  const selectedCategoryId = form.watch("categoryId");
  const subcategories = categoriesData?.categories?.filter(
    (category: any) => category.parentId === selectedCategoryId
  ) || [];
  
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
                      className="resize-none"
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
                      placeholder="Enter usage instructions"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions on how to use this prompt effectively.
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
                      placeholder="Enter the prompt text"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The actual prompt text that users will copy.
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
                    <Input placeholder="أدخل عنوان النموذج" {...field} dir="rtl" />
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
                      placeholder="أدخل وصف النموذج"
                      className="resize-none"
                      {...field}
                      dir="rtl"
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
                      placeholder="أدخل تعليمات الاستخدام"
                      className="resize-none"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions on how to use this prompt effectively in Arabic.
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
                      placeholder="أدخل نص النموذج"
                      className="min-h-[200px]"
                      {...field}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    The actual prompt text that users will copy in Arabic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isCategoriesLoading ? (
                          <div className="flex justify-center p-2">
                            <Spinner size="sm" />
                          </div>
                        ) : (
                          categoriesData?.categories
                            ?.filter((category: any) => !category.parentId)
                            .map((category: any) => (
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
              
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!selectedCategoryId || subcategories.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        This prompt will only be available to Pro subscribers.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <FormLabel>Keywords</FormLabel>
                <div className="flex mt-2">
                  <Input
                    placeholder="Add a keyword"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="flex-1"
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
                    className="ml-2"
                    onClick={addKeyword}
                  >
                    Add
                  </Button>
                </div>
                <FormDescription className="mt-2">
                  Press Enter or click Add to add a keyword.
                </FormDescription>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="text-sm">
                      {keyword}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeKeyword(keyword)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <FormLabel>Tools</FormLabel>
                <div className="mt-2 border rounded-md p-4">
                  {isToolsLoading ? (
                    <div className="flex justify-center p-2">
                      <Spinner size="sm" />
                    </div>
                  ) : toolsData?.tools?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {toolsData.tools.map((tool: any) => (
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
                                    checked={field.value?.includes(tool.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValue, tool.id]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter((value) => value !== tool.id)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {tool.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tools available.</p>
                  )}
                </div>
                <FormDescription className="mt-2">
                  Select the tools that this prompt works with.
                </FormDescription>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : initialData ? (
              "Update Prompt"
            ) : (
              "Create Prompt"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
