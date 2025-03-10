"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Bookmark, BookmarkCheck, Share2, Copy, Turtle, BarChart2 } from "lucide-react"
import Image from "next/image"
import { Category, Tool } from "@/types/prompts"
import { cn } from "@/lib/utils"
import { PromptModal } from "./prompt-modal"
import { AddToCatalogButton } from "@/components/catalogs/add-to-catalog-button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

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
  isBookmarked?: boolean
  onBookmarkChange?: (id: string, isBookmarked: boolean) => void
}

export function PromptCard({
  id,
  title,
  preview,
  isPro,
  copyCount,
  categories,
  tools: initialTools,
  isRTL = false,
  locale = 'en',
  isBookmarked = false,
  onBookmarkChange
}: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [tools, setTools] = useState(initialTools)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [bookmarkStatus, setBookmarkStatus] = useState(isBookmarked)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  
  // Validate tools on client-side to prevent rendering errors
  useEffect(() => {
    try {
      // Filter out tools with invalid iconUrl
      const validatedTools = initialTools.map(tool => ({
        ...tool,
        // Ensure iconUrl is a valid string or undefined
        iconUrl: typeof tool.iconUrl === 'string' && tool.iconUrl.trim() !== '' ? tool.iconUrl : undefined
      }))
      setTools(validatedTools)
    } catch (err) {
      console.error('Error validating tools:', err)
      // Fallback to tools without icons if there's an error
      setTools(initialTools.map(tool => ({ ...tool, iconUrl: undefined })))
    }
  }, [initialTools])

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
    } catch (err) {
      console.error('Copy error:', err);
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
    } catch (err) {
      console.error('Share error:', err);
      toast({
        title: "Error",
        description: "Failed to share prompt",
        variant: "destructive",
      })
    }
  }

  // Update local state when prop changes
  useEffect(() => {
    setBookmarkStatus(isBookmarked);
  }, [isBookmarked]);

  const handleBookmark = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark prompts",
        variant: "destructive",
      })
      router.push(`/${locale}/auth/login`)
      return
    }
    
    try {
      setIsBookmarking(true)
      
      // Ensure we have a valid ID
      if (!id) {
        throw new Error('Invalid prompt ID')
      }
      
      console.log('Toggling bookmark for prompt:', id)
      
      const method = bookmarkStatus ? 'DELETE' : 'POST'
      const response = await fetch(`/api/prompts/${id}/bookmark`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        // Special case for 'already bookmarked' error - treat as success
        if (responseData.error === "Prompt already bookmarked") {
          console.log('Prompt was already bookmarked, treating as success')
          setBookmarkStatus(true) // Ensure UI shows as bookmarked
          return // Exit early without throwing error
        }
        throw new Error(responseData.error || 'Failed to update bookmark')
      }

      // Update local state
      const newStatus = !bookmarkStatus
      setBookmarkStatus(newStatus)
      
      // Call the onBookmarkChange callback if provided
      if (onBookmarkChange) {
        onBookmarkChange(id, newStatus)
      }

      toast({
        title: bookmarkStatus ? "Removed from bookmarks" : "Added to bookmarks",
        description: bookmarkStatus ? "Prompt removed from your bookmarks" : "Prompt added to your bookmarks",
      })
      
      // Refresh the page to update other components that might display this prompt
      router.refresh()
    } catch (err) {
      console.error('Bookmark error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update bookmark",
        variant: "destructive",
      })
    } finally {
      setIsBookmarking(false)
    }
  }, [bookmarkStatus, id, session, router, toast, locale, onBookmarkChange])

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
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8", bookmarkStatus && "text-accent-purple")} 
                onClick={handleBookmark}
                disabled={isBookmarking || !session?.user}
              >
                {bookmarkStatus ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span className="sr-only">{bookmarkStatus ? "Remove bookmark" : "Bookmark"}</span>
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
                        {/* Wrap Image in error boundary */}
                        {(() => {
                          try {
                            return (
                              <Image
                                src={tool.iconUrl}
                                alt={tool.name}
                                fill
                                className="object-contain"
                                sizes="12px"
                                onError={(e) => {
                                  console.error('Image load error:', tool.iconUrl);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                unoptimized
                              />
                            );
                          } catch (err) {
                            console.error('Image render error:', err);
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="h-3 w-3 bg-muted rounded-sm" />
                  )}
                  {tool.name}
                </Badge>
              ))}
            </div>

            {/* Bottom row with copy count and buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
                <span className="text-sm">{copyCount}</span>
              </div>
              <div className="flex items-center gap-2">
                {bookmarkStatus && session?.user && (
                  <AddToCatalogButton
                    promptId={id}
                    size="sm"
                    variant="outline"
                  />
                )}
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
