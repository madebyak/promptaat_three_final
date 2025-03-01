"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Copy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";

// Fetch prompt API function
async function getPrompt(id: string) {
  const response = await fetch(`/api/cms/prompts/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch prompt");
  }
  
  return response.json();
}

interface ViewPromptProps {
  promptId: string;
  trigger?: React.ReactNode;
}

export default function ViewPrompt({ 
  promptId, 
  trigger 
}: ViewPromptProps) {
  const [open, setOpen] = useState(false);
  
  // Fetch prompt data
  const { data, isLoading, error } = useQuery({
    queryKey: ["prompt", promptId],
    queryFn: () => getPrompt(promptId),
    enabled: open, // Only fetch when dialog is open
  });
  
  const copyToClipboard = (text: string, language: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${language} prompt copied to clipboard`);
  };
  
  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
            <DialogDescription>
              View detailed information about this prompt.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Failed to load prompt data. Please try again.
            </div>
          ) : data?.prompt ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{data.prompt.titleEn}</h2>
                  <p className="text-muted-foreground">{data.prompt.titleAr}</p>
                </div>
                <Badge variant={data.prompt.isPro ? "default" : "secondary"}>
                  {data.prompt.isPro ? "Pro" : "Free"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{data.prompt.category?.name || "Uncategorized"}</p>
                      {data.prompt.subcategory && (
                        <p className="text-muted-foreground mt-1">
                          Subcategory: {data.prompt.subcategory.name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Copy Count</p>
                          <p className="text-lg font-medium">{data.prompt.copyCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="text-lg font-medium">
                            {new Date(data.prompt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Tabs defaultValue="english">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="arabic">Arabic</TabsTrigger>
                </TabsList>
                
                <TabsContent value="english" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{data.prompt.descriptionEn || "No description provided."}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{data.prompt.instructionEn || "No instructions provided."}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Prompt Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                        {data.prompt.promptTextEn}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="ml-auto"
                        onClick={() => copyToClipboard(data.prompt.promptTextEn, "English")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="arabic" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p dir="rtl">{data.prompt.descriptionAr || "No description provided."}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p dir="rtl">{data.prompt.instructionAr || "No instructions provided."}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Prompt Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-md whitespace-pre-wrap" dir="rtl">
                        {data.prompt.promptTextAr}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="ml-auto"
                        onClick={() => copyToClipboard(data.prompt.promptTextAr, "Arabic")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.prompt.keywords && data.prompt.keywords.length > 0 ? (
                        data.prompt.keywords.map((keyword: string) => (
                          <Badge key={keyword} variant="outline">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No keywords</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.prompt.tools && data.prompt.tools.length > 0 ? (
                        data.prompt.tools.map((tool: any) => (
                          <Badge key={tool.id} variant="outline">
                            {tool.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No tools</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p>No prompt data found.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
