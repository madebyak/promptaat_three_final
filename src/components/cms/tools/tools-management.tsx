"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Copy, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import CreateTool from "./create-tool";
import EditTool from "./edit-tool";
import DeleteTool from "./delete-tool";
import { fetchTools, PaginatedResponse } from "@/lib/api/cms/tools";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the tool type
interface Tool {
  id: string;
  name: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    promptTools?: number;
  };
}

// Page size options
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = 50;

export default function ToolsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search query changes
      setCurrentPage(1);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);
  
  // Fetch tools with pagination
  const { 
    data: paginatedResponse, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<PaginatedResponse<Tool>>({ 
    queryKey: ["cms-tools", debouncedSearchQuery, currentPage, pageSize],
    queryFn: () => fetchTools(debouncedSearchQuery, { page: currentPage, pageSize }),
    refetchOnWindowFocus: false,
  });
  
  // Extract tools and pagination info
  const tools = paginatedResponse?.data || [];
  const pagination = paginatedResponse?.pagination || {
    total: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1
  };
  
  // Copy ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("ID copied to clipboard");
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };
  
  // Truncate ID for display
  const truncateId = (id: string) => {
    return `${id.substring(0, 8)}...`;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>AI Tools</CardTitle>
            <CreateTool onSuccess={refetch} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Page Size Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={DEFAULT_PAGE_SIZE.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tools Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="flex justify-center items-center h-64 text-destructive">
                Error loading tools: {(error as Error).message}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : tools.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
                <p>No tools found</p>
                {debouncedSearchQuery && (
                  <p className="text-sm">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Tool ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead className="w-[80px]">Prompts</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((tool) => (
                      <TableRow key={tool.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono">{truncateId(tool.id)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(tool.id)}
                              title="Copy ID"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{tool.name}</TableCell>
                        <TableCell>
                          {tool.iconUrl ? (
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-md overflow-hidden border bg-gray-50">
                                <Image 
                                  src={tool.iconUrl} 
                                  alt={tool.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                  onError={(e) => {
                                    const imgElement = e.target as HTMLImageElement;
                                    imgElement.src = "https://via.placeholder.com/32?text=Error";
                                  }}
                                />
                              </div>
                              <a 
                                href={tool.iconUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-foreground"
                                title={tool.iconUrl}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium">
                            {tool._count?.promptTools ?? 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tool.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tool.updatedAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <EditTool tool={tool} onSuccess={refetch} />
                            <DeleteTool 
                              id={tool.id} 
                              name={tool.name} 
                              promptCount={tool._count?.promptTools ?? 0} 
                              onSuccess={refetch} 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{tools.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> tools
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </Button>
                      
                      <div className="text-sm">
                        Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}