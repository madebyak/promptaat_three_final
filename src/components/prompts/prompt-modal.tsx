'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Turtle, Copy, X, BarChart2, Calendar, Bookmark, Share2 } from "lucide-react"
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
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isOpen && promptId) {
      fetchPromptDetails()
    }
  }, [isOpen, promptId])

  const fetchPromptDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/prompts/${promptId}?locale=${locale}`)
      if (!response.ok) throw new Error('Failed to fetch prompt details')
      const data = await response.json()
      setPrompt(data)
    } catch (err) {
      setError('Failed to load prompt details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share prompt",
        variant: "destructive",
      })
    }
  }

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
              className="h-8 w-8" 
            >
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">Bookmark</span>
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
            <Alert variant="secondary" className="mb-6">
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
