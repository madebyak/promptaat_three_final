"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button, 
  buttonVariants 
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  ArrowUpDown,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreatePrompt from "./create-prompt";
import ViewPrompt from "./view-prompt";
import EditPrompt from "./edit-prompt";
import DeletePrompt from "./delete-prompt";

interface Prompt {
  id: string;
  titleEn: string;
  titleAr: string;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
  copyCount: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PromptsResponse {
  prompts: Prompt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

async function getPrompts(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  categoryId?: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<PromptsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (search) {
    params.append("search", search);
  }

  if (categoryId) {
    params.append("categoryId", categoryId);
  }

  const response = await fetch(`/api/cms/prompts?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch prompts");
  }
  
  return response.json();
}

async function getCategories() {
  const response = await fetch("/api/cms/categories");
  
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  return response.json();
}

export default function PromptsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch prompts
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<PromptsResponse>({
    queryKey: ["prompts", page, limit, debouncedSearchQuery, categoryId, sortBy, sortOrder],
    queryFn: () => getPrompts(page, limit, debouncedSearchQuery, categoryId, sortBy, sortOrder),
  });

  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!data) return null;
    
    const { pagination } = data;
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          onClick={() => setPage(1)}
          isActive={pagination.page === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Show ellipsis if needed
    if (pagination.page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Show current page and adjacent pages
    for (let i = Math.max(2, pagination.page - 1); i <= Math.min(pagination.totalPages - 1, pagination.page + 1); i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setPage(i)}
            isActive={pagination.page === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis if needed
    if (pagination.page < pagination.totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there's more than one page
    if (pagination.totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            onClick={() => setPage(pagination.totalPages)}
            isActive={pagination.page === pagination.totalPages}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      {isError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error instanceof Error ? error.message : "An error occurred"}
              </h3>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompts</CardTitle>
              <CardDescription>
                Manage your prompts and templates
              </CardDescription>
            </div>
            <CreatePrompt onSuccess={refetch} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={categoryId || ""}
                onValueChange={(value) => {
                  setCategoryId(value === "" ? undefined : value);
                  setPage(1); // Reset to first page on category change
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categoriesData?.categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(parseInt(value));
                  setPage(1); // Reset to first page on limit change
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            {isLoading ? (
              <div className="flex justify-center items-center p-4 h-32">
                <Spinner size="lg" />
              </div>
            ) : data && data.prompts.length > 0 ? (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("titleEn")}
                        >
                          Title
                          {sortBy === "titleEn" && (
                            <ChevronDown 
                              className={cn(
                                "ml-1 h-4 w-4",
                                sortOrder === "desc" ? "transform rotate-180" : ""
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("isPro")}
                        >
                          Type
                          {sortBy === "isPro" && (
                            <ChevronDown 
                              className={cn(
                                "ml-1 h-4 w-4",
                                sortOrder === "desc" ? "transform rotate-180" : ""
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <div 
                          className="flex items-center justify-end cursor-pointer"
                          onClick={() => handleSort("copyCount")}
                        >
                          Copy Count
                          {sortBy === "copyCount" && (
                            <ChevronDown 
                              className={cn(
                                "ml-1 h-4 w-4",
                                sortOrder === "desc" ? "transform rotate-180" : ""
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort("createdAt")}
                        >
                          Created
                          {sortBy === "createdAt" && (
                            <ChevronDown 
                              className={cn(
                                "ml-1 h-4 w-4",
                                sortOrder === "desc" ? "transform rotate-180" : ""
                              )} 
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.prompts.map((prompt) => (
                      <TableRow key={prompt.id}>
                        <TableCell className="font-medium">{prompt.titleEn}</TableCell>
                        <TableCell>{prompt.category?.name || "Uncategorized"}</TableCell>
                        <TableCell>
                          <Badge variant={prompt.isPro ? "default" : "secondary"}>
                            {prompt.isPro ? "Pro" : "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{prompt.copyCount}</TableCell>
                        <TableCell>
                          {new Date(prompt.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <ViewPrompt 
                                  promptId={prompt.id}
                                  trigger={
                                    <div className="flex items-center w-full">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </div>
                                  }
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <EditPrompt 
                                  promptId={prompt.id}
                                  onSuccess={refetch}
                                  trigger={
                                    <div className="flex items-center w-full">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </div>
                                  }
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <DeletePrompt 
                                  promptId={prompt.id}
                                  promptTitle={prompt.titleEn}
                                  onSuccess={refetch}
                                  trigger={
                                    <div className="flex items-center w-full text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </div>
                                  }
                                />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-500">
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, data.pagination.total)} of{" "}
                      {data.pagination.total} prompts
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          {data.pagination.hasPrevPage ? (
                            <PaginationLink onClick={() => setPage(page - 1)}>
                              <ChevronLeft className="h-4 w-4 mr-2" />
                              Previous
                            </PaginationLink>
                          ) : (
                            <Button variant="outline" size="sm" disabled className="gap-1">
                              <ChevronLeft className="h-4 w-4" />
                              <span>Previous</span>
                            </Button>
                          )}
                        </PaginationItem>
                        
                        {renderPaginationItems()}
                        
                        <PaginationItem>
                          {data.pagination.hasNextPage ? (
                            <PaginationLink onClick={() => setPage(page + 1)}>
                              Next
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </PaginationLink>
                          ) : (
                            <Button variant="outline" size="sm" disabled className="gap-1">
                              <span>Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>No prompts found.</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery ? "Try a different search term." : "Add your first prompt to get started."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
