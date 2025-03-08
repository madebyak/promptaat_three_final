'use client'

import { useEffect, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Turtle, Copy, BarChart2, Calendar, Bookmark, BookmarkCheck, Share2 } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PromptDetail, PromptModalProps } from "@/types/prompts"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function PromptModal({
  promptId,
  isOpen,
  onClose,
  isRTL = false,
  locale = 'en'
}: PromptModalProps) {
  const [prompt, setPrompt] = useState<PromptDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()

  const fetchPromptDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = `/api/prompts/${promptId}?locale=${locale}`
      console.log('Fetching prompt details from:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e)
        }
        throw new Error(errorData?.error || `Failed to fetch prompt details: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Prompt data received:', data)
      setPrompt(data)
    } catch (err) {
      console.error('Error fetching prompt:', err)
      setError('Failed to load prompt details')
    } finally {
      setLoading(false)
    }
  }, [promptId, locale])

  const handleCopy = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt.promptText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Success",
        description: "Prompt copied to clipboard",
      })
    } catch (err) {
      console.error('Error copying prompt:', err)
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
      const shareData = {
        title: prompt.title,
        text: prompt.promptText,
        url: `${window.location.origin}/prompts/${promptId}`,
      }
      
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast({
          title: "Success",
          description: "Link copied to clipboard",
        })
      }
    } catch (err) {
      console.error('Error sharing prompt:', err)
      toast({
        title: "Error",
        description: "Failed to share prompt",
        variant: "destructive",
      })
    }
  }

  const toggleBookmark = useCallback(async () => {
    if (!prompt || !session?.user) {
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to bookmark prompts",
          variant: "destructive",
        })
        router.push(`/${locale}/auth/login`)
      }
      return
    }

    try {
      setIsBookmarking(true)
      const method = prompt.isBookmarked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/prompts/${promptId}/bookmark`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update bookmark')
      }

      // Update local state
      setPrompt(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked,
        bookmarkCount: prev.isBookmarked 
          ? Math.max(0, prev.bookmarkCount - 1) 
          : prev.bookmarkCount + 1
      } : null)

      toast({
        title: prompt.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: prompt.isBookmarked 
          ? "Prompt has been removed from your bookmarks" 
          : "Prompt has been added to your bookmarks",
      })

      // Refresh the page to update other components that might display this prompt
      router.refresh()
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      })
    } finally {
      setIsBookmarking(false)
    }
  }, [prompt, promptId, session, router, toast, locale])
  
  useEffect(() => {
    if (isOpen && promptId) {
      fetchPromptDetails()
    }
  }, [isOpen, promptId, fetchPromptDetails])

  if (!isOpen) return null
  if (loading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Prompt Details</DialogTitle>
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DialogContent>
    </Dialog>
  )
  if (error || !prompt) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Error</DialogTitle>
        <div className="flex items-center justify-center p-8 text-destructive">
          {error || 'Failed to load prompt'}
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Prompt Details</DialogTitle>
        <div className="relative">
          {/* Header Actions */}
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", prompt.isBookmarked && "text-accent-purple")}
              onClick={toggleBookmark}
              disabled={isBookmarking || !session?.user}
            >
              {prompt.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              <span className="sr-only">{prompt.isBookmarked ? "Remove bookmark" : "Bookmark"}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>

          {/* Badge and Title section */}
          <div className="mb-6">
            <div className="mb-3">
              {prompt.isPro ? (
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
            <h2 className={cn(
              "text-2xl font-semibold",
              isRTL && "text-right"
            )}>
              {prompt.title}
            </h2>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.categories.map((category) => (
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

          {/* Tools section */}
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.tools?.map((tool) => (
              <Badge 
                key={tool.id}
                variant="secondary" 
                className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 bg-secondary/20"
              >
                {tool.iconUrl && (
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
                )}
                {tool.name}
              </Badge>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h3>
            <p className={cn(
              "text-sm",
              isRTL && "text-right"
            )}>
              {prompt.description}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              <span>Copied {prompt.copyCount} times</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Created {format(new Date(prompt.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {prompt.updatedAt !== prompt.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Updated {format(new Date(prompt.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Prompt Text */}
          <Alert className="mb-6">
            <div className="relative">
              <AlertDescription className="whitespace-pre-wrap font-mono text-sm pr-24">
                {prompt.promptText}
              </AlertDescription>
              <Button
                className="absolute top-0 right-0 mt-2 mr-2"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3 mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </Alert>

          {/* Instructions */}
          {prompt.instruction && (
            <Alert variant="default" className="mb-6">
              <AlertDescription className="whitespace-pre-wrap text-sm">
                {prompt.instruction}
              </AlertDescription>
            </Alert>
          )}

          {/* Keywords */}
          {prompt.keywords && prompt.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prompt.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-muted/50"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
