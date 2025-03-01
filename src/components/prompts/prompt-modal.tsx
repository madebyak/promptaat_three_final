"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bookmark, Share2, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Prompt {
  id: string
  title: string
  description: string
  categories: Array<{ id: string; name: string }>
  tools: Array<{ id: string; name: string }>
}

interface PromptModalProps {
  promptId: string
  isOpen: boolean
  onClose: () => void
}

export function PromptModal({ promptId, isOpen, onClose }: PromptModalProps) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchPromptDetails()
    }
  }, [isOpen, promptId])

  const fetchPromptDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/prompts/${promptId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch prompt details")
      }

      const data = await response.json()
      setPrompt(data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load prompt details",
        variant: "destructive",
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!prompt) return

    try {
      await navigator.clipboard.writeText(prompt.description)
      toast({
        title: "Success",
        description: "Prompt copied to clipboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (!prompt) return

    try {
      await navigator.share({
        title: prompt.title,
        text: prompt.description,
        url: window.location.href,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to share prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : prompt ? (
          <Card>
            <CardHeader>
              <CardTitle>{prompt.title}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-4 w-4" />
                  <span className="sr-only">Bookmark</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {prompt.description}
              </p>
              {prompt.categories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {prompt.categories.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {prompt.tools.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tools.map((tool) => (
                      <Badge key={tool.id} variant="secondary">
                        {tool.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Failed to load prompt</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
