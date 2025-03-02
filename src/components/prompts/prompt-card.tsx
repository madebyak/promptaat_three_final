"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Heart, Copy, Share2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Category, Tool } from "@/types/prompts"

interface PromptCardProps {
  id: string
  title: string
  preview: string
  isPro: boolean
  copyCount: number
  categories: Category[]
  tools: Tool[]
  isRTL?: boolean
}

export function PromptCard({
  id,
  title,
  preview,
  isPro,
  copyCount,
  categories,
  tools,
  isRTL = false,
}: PromptCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview)
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
    try {
      await navigator.share({
        title,
        text: preview,
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {isPro && (
            <div className="px-2 py-1 text-xs font-medium text-accent-purple bg-accent-purple/10 rounded">
              PRO
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {preview}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool.id}
                className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded"
              >
                {tool.name}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy size={20} />
              <span className="sr-only">Copy</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 size={20} />
              <span className="sr-only">Share</span>
            </Button>
            <span className="text-sm text-muted-foreground">{copyCount} copies</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
