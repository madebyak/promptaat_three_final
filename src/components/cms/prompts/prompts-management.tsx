"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreatePrompt from "./create-prompt";
import ViewPrompt from "./view-prompt";
import EditPrompt from "./edit-prompt";
import DeletePrompt from "./delete-prompt";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadPromptsCsvTemplate, exportPromptsToCsv, performBulkAction } from "@/lib/api/cms/prompts";

type Category = {
  id: string
  name: string
  slug: string
}

type Prompt = {
  id: string
  titleEn: string
  titleAr: string
  isPro: boolean
  createdAt: string
  updatedAt: string
  copyCount: number
  category?: Category
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type PromptsResponse = {
  prompts: Prompt[]
  pagination: Pagination
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

async function getCategories(): Promise<{ categories: Category[] }> {
  const response = await fetch("/api/cms/categories");
  
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  
  return response.json();
}

function PromptsManagement() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Basic filtering and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Bulk action state
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"delete" | "togglePro" | "activate" | "deactivate">("delete");
  
  // CSV import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; message: string }>>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selected prompts when page changes
  useEffect(() => {
    setSelectedPrompts([]);
    setSelectAll(false);
  }, [page, limit, debouncedSearchQuery, categoryId]);

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

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: (params: { promptIds: string[]; action: "delete" | "togglePro" | "activate" | "deactivate" }) => 
      performBulkAction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setBulkActionDialogOpen(false);
      setSelectedPrompts([]);
      setSelectAll(false);
      toast.success(`Bulk action completed successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to perform bulk action: ${error.message || 'Unknown error'}`);
    }
  });

  // Handle CSV import
  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }

    setImporting(true);
    setImportErrors([]);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const response = await fetch("/api/cms/prompts/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to import prompts");
      }

      if (result.errors && result.errors.length > 0) {
        setImportErrors(result.errors);
        toast.warning(`Import completed with ${result.errors.length} errors`);
      } else {
        toast.success(`Successfully imported ${result.imported} prompts`);
        setImportDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["prompts"] });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadPromptsCsvTemplate();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prompts_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Template downloaded successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to download template: ${errorMessage}`);
    }
  };

  // Export prompts to CSV
  const handleExport = async () => {
    try {
      const response = await exportPromptsToCsv();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prompts_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Prompts exported successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to export prompts: ${errorMessage}`);
    }
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // Handle checkbox selection
  const togglePromptSelection = (promptId: string) => {
    setSelectedPrompts(prev => {
      if (prev.includes(promptId)) {
        return prev.filter(id => id !== promptId);
      } else {
        return [...prev, promptId];
      }
    });
  };

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectAll || (data && selectedPrompts.length === data.prompts.length)) {
      setSelectedPrompts([]);
      setSelectAll(false);
    } else if (data) {
      setSelectedPrompts(data.prompts.map(prompt => prompt.id));
      setSelectAll(true);
    }
  };

  // Open file input dialog
  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fetch categories
  const { 
    data: categoriesData
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
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openFileInput}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Prompts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export All Prompts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CreatePrompt onSuccess={refetch} />
              
              {/* Hidden file input for CSV import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                onClick={(e) => {
                  // Reset the value to allow selecting the same file again
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </div>
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
                value={categoryId || "all"}
                onValueChange={(value) => {
                  setCategoryId(value === "all" ? undefined : value);
                  setPage(1); // Reset to first page on category change
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoriesData?.categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
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
                {selectedPrompts.length > 0 && (
                  <div className="p-2 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{selectedPrompts.length} selected</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedPrompts([]);
                          setSelectAll(false);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Bulk Actions
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setBulkAction("togglePro");
                          setBulkActionDialogOpen(true);
                        }}>
                          Toggle Pro Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setBulkAction("activate");
                          setBulkActionDialogOpen(true);
                        }}>
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setBulkAction("deactivate");
                          setBulkActionDialogOpen(true);
                        }}>
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setBulkAction("delete");
                            setBulkActionDialogOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectAll || (data && data.prompts.length > 0 && selectedPrompts.length === data.prompts.length)} 
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
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
                        <TableCell>
                          <Checkbox 
                            checked={selectedPrompts.includes(prompt.id)} 
                            onCheckedChange={() => togglePromptSelection(prompt.id)}
                            aria-label={`Select ${prompt.titleEn}`}
                          />
                        </TableCell>
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

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkAction === "delete" ? "Delete Prompts" : 
               bulkAction === "togglePro" ? "Toggle Pro Status" : 
               bulkAction === "activate" ? "Activate Prompts" : "Deactivate Prompts"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "delete" ? 
                `Are you sure you want to delete ${selectedPrompts.length} prompts? This action cannot be undone.` : 
                `Are you sure you want to ${bulkAction} ${selectedPrompts.length} prompts?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => bulkActionMutation.mutate({ 
                promptIds: selectedPrompts, 
                action: bulkAction 
              })}
              className={bulkAction === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {bulkAction === "delete" ? "Delete" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Prompts</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import prompts. You can download a template to see the required format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {importFile ? (
              <div className="p-2 border rounded flex items-center justify-between">
                <span className="text-sm truncate max-w-[200px]">{importFile.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setImportFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={openFileInput}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">CSV file (max 5MB)</p>
              </div>
            )}

            {importErrors.length > 0 && (
              <div className="border rounded-md p-3 bg-red-50">
                <h4 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h4>
                <div className="max-h-[200px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {importErrors.map((error, index) => (
                      <li key={index} className="text-red-700">
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDownloadTemplate()}>Download Template</Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile || importing}
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PromptsManagement;
