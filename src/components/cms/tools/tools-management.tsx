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
import { Search, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import CreateTool from "./create-tool";
import EditTool from "./edit-tool";
import DeleteTool from "./delete-tool";
import { fetchTools } from "@/lib/api/cms/tools";
import { Button } from "@/components/ui/button";

// Define the tool type
interface Tool {
  id: string;
  name: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    promptTools: number;
  };
}

export default function ToolsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch tools
  const { 
    data: tools = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["cms-tools", debouncedSearchQuery],
    queryFn: () => fetchTools(debouncedSearchQuery),
  });
  
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tools Table */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <div className="flex justify-center items-center h-64 text-destructive">
                Error loading tools: {(error as Error).message}
              </div>
            ) : tools.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
                <p>No tools found</p>
                {debouncedSearchQuery && (
                  <p className="text-sm">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Prompts</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tools.map((tool: Tool) => (
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
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell>
                          {tool.iconUrl ? (
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-md overflow-hidden border">
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
                            {tool._count.promptTools}
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
                              promptCount={tool._count.promptTools} 
                              onSuccess={refetch} 
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}