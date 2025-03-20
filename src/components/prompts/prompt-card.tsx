"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Bookmark, BookmarkCheck, Share2, Copy, Turtle, BarChart2, CheckCircle } from "lucide-react"
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
  keywords: string[]
  isRTL?: boolean
  locale?: string
  isBookmarked?: boolean
  onBookmarkChange?: (id: string, isBookmarked: boolean) => void
  loading?: "eager" | "lazy"
}

export function PromptCard({
  id,
  title,
  preview,
  isPro,
  copyCount: initialCopyCount,
  categories,
  tools: initialTools,
  keywords,
  isRTL = false,
  locale = 'en',
  isBookmarked = false,
  onBookmarkChange,
  loading = "lazy"
}: PromptCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [tools, setTools] = useState(initialTools)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [bookmarkStatus, setBookmarkStatus] = useState(isBookmarked)
  const [copyCount, setCopyCount] = useState(initialCopyCount)
  const prefetched = useRef(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  
  // Prefetch prompt details when hovering over the card
  const prefetchPromptData = useCallback(() => {
    if (!prefetched.current) {
      const prefetchController = new AbortController();
      // Add a timeout to cancel the prefetch if it takes too long
      const timeoutId = setTimeout(() => prefetchController.abort(), 3000);
      
      fetch(`/api/prompts/${id}?locale=${locale}`, {
        signal: prefetchController.signal,
        headers: { 
          'Purpose': 'prefetch',
          'Cache-Control': 'max-age=3600' // Cache for 1 hour
        }
      })
      .then(response => {
        clearTimeout(timeoutId);
        if (response.ok) {
          // Just parse the response to warm the cache, we don't need to do anything with the data
          return response.json();
        }
      })
      .then(() => {
        prefetched.current = true;
      })
      .catch(err => {
        // Silently ignore prefetch errors
        if (err.name !== 'AbortError') {
          console.error('Prefetch error (non-critical):', err);
        }
      });
    }
  }, [id, locale]);
  
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

  // Memoize the copy handler to prevent unnecessary re-renders
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(preview)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      
      // Update copy count in the database
      try {
        // Use a non-blocking approach to update the copy count
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(`/api/prompts/${id}/copy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json()
          // Update local state with new copy count
          setCopyCount(data.copyCount)
        }
      } catch (apiError) {
        // Ignore AbortError as it's expected in some cases
        if (apiError instanceof Error && apiError.name !== 'AbortError') {
          console.error('Error updating copy count:', apiError)
        }
        // Don't show error to user, just log it
      }
      
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
  }, [id, preview, toast])

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
      
      // Set optimistic UI update immediately
      const newStatus = !bookmarkStatus
      setBookmarkStatus(newStatus)
      
      // Call the API
      const method = newStatus ? 'POST' : 'DELETE'
      const response = await fetch(`/api/prompts/${id}/bookmark`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        setBookmarkStatus(!newStatus)
        
        // Special case for 'already bookmarked' error - set status to bookmarked
        if (responseData.error === "Prompt already bookmarked") {
          setBookmarkStatus(true)
          return // Exit early without throwing error
        }
        throw new Error(responseData.error || 'Failed to update bookmark')
      }

      // Call the onBookmarkChange callback if provided to notify parent component
      if (onBookmarkChange) {
        onBookmarkChange(id, newStatus)
      }

      toast({
        title: !newStatus ? "Removed from bookmarks" : "Added to bookmarks",
        description: !newStatus ? "Prompt removed from your bookmarks" : "Prompt added to your bookmarks",
      })
      
      // Update global state by revalidating data instead of full refresh for better performance
      // This will update any other components displaying this prompt
      const event = new CustomEvent('bookmark-update', { 
        detail: { promptId: id, isBookmarked: newStatus } 
      })
      window.dispatchEvent(event)
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
        onMouseEnter={prefetchPromptData}
      >
        <div className="flex flex-col h-full p-4">
          {/* Top row with badges */}
          <div className={cn(
            "flex items-center justify-between gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <div className="flex items-center gap-2">
              {isPro ? (
                <Badge variant="purple" className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  <Crown className="h-3 w-3" />
                  PRO
                </Badge>
              ) : (
                <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-light-grey-light dark:bg-dark">
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
          <div className={cn(
            "flex flex-wrap gap-2 mb-4",
            isRTL && "justify-end"
          )}>
            {categories.map((category) => (
              <div key={category.id} className={cn(
                "flex items-center gap-1.5",
                isRTL && "flex-row-reverse"
              )}>
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
            "text-sm text-light-grey line-clamp-3 mb-4",
            isRTL && "text-right"
          )}>
            {preview}
          </p>

          {/* Bottom section */}
          <div className="mt-auto">
            {/* Tools */}
            <div className={cn(
              "flex flex-wrap gap-2 mb-3",
              isRTL && "justify-end"
            )}>
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
                                loading={loading}
                                className="object-contain"
                                sizes="12px"
                                onError={(e) => {
                                  // Silently handle image errors without console logs
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
            <div className={cn(
              "flex items-center justify-between gap-3",
              isRTL && "flex-row-reverse"
            )}>
              <div className={cn(
                "flex items-center gap-1 text-muted-foreground",
                isRTL && "flex-row-reverse"
              )}>
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
                  variant={isCopied ? "outline" : "secondary"}
                  size="sm"
                  className={cn(
                    "flex-shrink-0 transition-all duration-200",
                    isCopied ? "border-accent-green text-accent-green" : "bg-accent-green text-black hover:bg-accent-green/90"
                  )}
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <CheckCircle className={cn("h-3 w-3", isRTL ? "ml-2" : "mr-2")} />
                  ) : (
                    <Copy className={cn("h-3 w-3", isRTL ? "ml-2" : "mr-2")} />
                  )}
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
