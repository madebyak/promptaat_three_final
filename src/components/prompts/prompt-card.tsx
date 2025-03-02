"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Bookmark, Share2, Copy, Turtle, BarChart2 } from "lucide-react"
import Image from "next/image"
import { Category, Tool } from "@/types/prompts"
import { cn } from "@/lib/utils"
import { PromptModal } from "./prompt-modal"

interface PromptCardProps {
  id: string
  title: string
  preview: string
  isPro: boolean
  copyCount: number
  categories: Category[]
  tools: Tool[]
  isRTL?: boolean
  locale?: string
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
  locale = 'en'
}: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(preview)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Success",
        description: "Prompt copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.share({
        title,
        text: preview,
        url: window.location.href,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share prompt",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement bookmark functionality
  }

  return (
    <>
      <Card 
        className="h-full hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-col h-full p-4">
          {/* Top row with badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isPro ? (
                <Badge variant="purple" className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  <Crown className="h-3 w-3" />
                  PRO
                </Badge>
              ) : (
                <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  <Turtle className="h-3 w-3" />
                  Basic
                </Badge>
              )}
            </div>
            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBookmark}>
                <Bookmark className="h-4 w-4" />
                <span className="sr-only">Bookmark</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>

          {/* Title with improved spacing */}
          <h3 className={cn(
            "text-lg font-semibold mt-4 mb-2 line-clamp-2",
            isRTL ? "text-right" : "text-left"
          )}>
            {title}
          </h3>

          {/* Categories below title */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {category.name}
                </Badge>
                {category.subcategory && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {category.subcategory.name}
                    </Badge>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Preview text */}
          <p className={cn(
            "text-sm text-muted-foreground mb-4 line-clamp-3",
            isRTL ? "text-right" : "text-left"
          )}>
            {preview}
          </p>

          {/* Bottom section */}
          <div className="mt-auto">
            {/* Tools */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tools.map((tool) => (
                <Badge 
                  key={tool.id} 
                  variant="outline"
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5"
                >
                  {tool.iconUrl ? (
                    <div className="relative h-3 w-3">
                      <div className="relative h-3 w-3 overflow-hidden rounded-sm">
                        <div className="absolute inset-0 bg-muted" />
                        <Image
                          src={tool.iconUrl}
                          alt={tool.name}
                          fill
                          className="object-contain"
                          sizes="12px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-3 w-3 bg-muted rounded-sm" />
                  )}
                  {tool.name}
                </Badge>
              ))}
            </div>

            {/* Bottom row with copy count and button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
                <span className="text-sm">{copyCount}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="flex-shrink-0"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3 mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <PromptModal
        promptId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
        isRTL={isRTL}
      />
    </>
  )
}
