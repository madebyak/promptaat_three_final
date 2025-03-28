'use client'

import { useEffect, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Turtle, Copy, BarChart2, Calendar, Bookmark, BookmarkCheck, CheckCircle } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PromptDetail, PromptModalProps } from "@/types/prompts"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ProductStructuredData } from "@/components/seo/product-seo"
import { ProPromptContent } from "./pro-prompt-content"
import { useTranslations } from "next-intl"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<boolean | null>(null)
  const [showProToAll, setShowProToAll] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const router = useRouter()
  const t = useTranslations('Prompts')

  const fetchPromptDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = `/api/prompts/${promptId}?locale=${locale}`
      
      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        // Add cache control headers to improve caching
        headers: {
          'Cache-Control': 'max-age=3600' // Cache for 1 hour
        }
      })
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          // Silent catch
        }
        throw new Error(errorData?.error || `Failed to fetch prompt details: ${response.status}`)
      }
      
      const data = await response.json()
      setPrompt(data)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        console.error('Error fetching prompt:', err)
        // Check if this is a Pro subscription error
        if (err instanceof Error && err.message.includes('Pro subscription')) {
          setError(err.message)
        } else {
          setError('Failed to load prompt details')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [promptId, locale])

  // Check subscription status when session changes
  useEffect(() => {
    // If there's a user session and we have a prompt that's Pro, check subscription status
    if (session?.user && prompt?.isPro) {
      fetch('/api/user/subscription-status')
        .then(res => res.json())
        .then(data => {
          setUserSubscriptionStatus(data.isSubscribed);
        })
        .catch(() => {
          // Default to false on error
          setUserSubscriptionStatus(false);
        });
    } else if (!session?.user) {
      // No session means no subscription
      setUserSubscriptionStatus(false);
    } else if (prompt && !prompt.isPro) {
      // Non-Pro prompt, no need to check
      setUserSubscriptionStatus(true);
    }
  }, [session, prompt]);

  // Fetch system setting for showing PRO prompts to all users
  useEffect(() => {
    async function fetchShowProToAllSetting() {
      try {
        const response = await fetch(`/api/system-settings?key=showProToAll`);
        if (response.ok) {
          const data = await response.json();
          setShowProToAll(data.value === "true");
        }
      } catch (error) {
        console.error("Error fetching showProToAll setting:", error);
      }
    }
    
    fetchShowProToAllSetting();
  }, []);

  const handleCopy = useCallback(async () => {
    if (!prompt) return
    
    // Check if user is logged in
    if (!session?.user) {
      // Show toast explaining why copying is not allowed
      toast({
        title: t('loginRequired'),
        description: t('loginToCopy'),
      })
      
      // Redirect to login page
      router.push(`/${locale}/auth/login`)
      return
    }
    
    // Check if this is a Pro prompt and user is not subscribed
    if (prompt.isPro && userSubscriptionStatus === false && !showProToAll) {
      // Show toast explaining why copying is not allowed
      toast({
        title: t('proContent'),
        description: t('proSubscriptionRequired'),
      })
      return
    }
    
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(prompt.promptText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      
      // Update copy count in the database
      try {
        // Use a non-blocking approach to update the copy count
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
        
        const response = await fetch(`/api/prompts/${promptId}/copy`, {
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
          setPrompt(prev => prev ? {
            ...prev,
            copyCount: data.copyCount
          } : null)
        }
      } catch (apiError) {
        // Ignore AbortError as it's expected in some cases
        if (apiError instanceof Error && apiError.name !== 'AbortError') {
          console.error('Error updating copy count:', apiError)
        }
        // Don't show error to user, just log it
      }
      
      toast({
        title: t('copySuccess'),
        description: t('promptCopied'),
      })
    } catch (err) {
      console.error('Error copying prompt:', err)
      toast({
        title: t('copyError'),
        description: t('copyErrorDescription'),
        variant: "destructive",
      })
    }
  }, [prompt, promptId, toast, userSubscriptionStatus, t, session, router, locale, showProToAll])

  const toggleBookmark = useCallback(async () => {
    if (!prompt || !session?.user) {
      if (!session?.user) {
        toast({
          title: t('authenticationRequired'),
          description: t('signInToBookmark'),
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
        title: prompt.isBookmarked ? t('removedFromBookmarks') : t('addedToBookmarks'),
        description: prompt.isBookmarked 
          ? t('promptRemovedFromBookmarks') 
          : t('promptAddedToBookmarks'),
      })

      // Refresh the page to update other components that might display this prompt
      router.refresh()
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('failedToUpdateBookmark'),
        variant: "destructive",
      })
    } finally {
      setIsBookmarking(false)
    }
  }, [prompt, promptId, session, router, toast, locale, t])
  
  // Listen for bookmark updates from other components
  useEffect(() => {
    const handleBookmarkUpdate = (event: CustomEvent<{promptId: string, isBookmarked: boolean}>) => {
      const { promptId: updatedPromptId, isBookmarked } = event.detail
      
      // Only update if this is the same prompt being displayed
      if (prompt && updatedPromptId === promptId) {
        setPrompt(prev => prev ? {
          ...prev,
          isBookmarked,
          bookmarkCount: isBookmarked 
            ? (prompt.bookmarkCount || 0) + 1 
            : Math.max(0, (prompt.bookmarkCount || 0) - 1)
        } : null)
      }
    }

    // Add event listener
    window.addEventListener('bookmark-update', handleBookmarkUpdate as EventListener)
    
    // Cleanup
    return () => {
      window.removeEventListener('bookmark-update', handleBookmarkUpdate as EventListener)
    }
  }, [promptId, prompt])

  // Fetch prompt details when modal opens
  useEffect(() => {
    if (isOpen && promptId) {
      // Add a small delay to prevent immediate loading when modal is opened
      // This improves perceived performance by allowing the modal animation to complete first
      const timeoutId = setTimeout(() => {
        fetchPromptDetails()
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, promptId, fetchPromptDetails])

  if (!isOpen) return null
  if (loading) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        "w-full p-4 sm:p-6",
        "sm:max-w-2xl",
        "sm:rounded-lg",
        // Mobile-specific styles
        "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-xl",
        // Animation for mobile
        "max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom"
      )}>
        <DialogTitle className="sr-only">Prompt Details</DialogTitle>
        <div className="space-y-4">
          {/* Badge and Title skeleton */}
          <div className="mb-4 sm:mb-6">
            <div className="mb-3">
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Categories skeleton */}
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Tools skeleton */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Description skeleton */}
          <div className="mb-4 sm:mb-6">
            <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          </div>
          
          {/* Prompt text skeleton */}
          <div className="h-40 w-full bg-muted animate-pulse rounded mb-4 sm:mb-6" />
          
          {/* Keywords skeleton */}
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
  if (error || !prompt) return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        "w-full p-4 sm:p-6",
        "sm:max-w-2xl",
        "sm:rounded-lg",
        // Mobile-specific styles
        "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-xl",
        // Animation for mobile
        "max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom"
      )}>
        <DialogTitle className="sr-only">Error</DialogTitle>
        
        {/* Pro subscription required error */}
        {error && error.includes("Pro subscription") ? (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="mb-6 w-full max-w-[200px]">
              <Image 
                src="/Go-pro.svg" 
                alt="Pro Subscription Required" 
                width={200} 
                height={200} 
                className="w-full h-auto"
              />
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">{t('onlyForProMembers')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('unlockPremiumPrompt')}
            </p>
            <Button 
              onClick={() => {
                onClose();
                router.push('/pricing');
              }}
              className="bg-accent-green hover:bg-accent-green/90 text-black font-medium px-6"
            >
              <Crown className="mr-2 h-4 w-4" />
              {t('goPro')}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-destructive">
            {error || t('failedToLoadPrompt')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {prompt && (
        <ProductStructuredData
          productId={prompt.id}
          name={prompt.title}
          description={prompt.description || prompt.promptText.substring(0, 150)}
          image={`https://promptaat.com/api/og?title=${encodeURIComponent(prompt.title)}`}
          authorName="Promptaat"
          price={prompt.isPro ? 9.99 : 0}
          priceCurrency="USD"
          ratingValue={4.5}
          ratingCount={10}
          category={prompt.categories?.length > 0 ? prompt.categories[0].name : undefined}
          locale={locale}
        />
      )}
      
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        "w-full p-4 sm:p-6",
        "sm:max-w-2xl",
        "sm:rounded-lg",
        // Mobile-specific styles
        "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-xl",
        // Animation for mobile
        "max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom"
      )}>
        <DialogTitle className="sr-only">Prompt Details</DialogTitle>
        <div className="relative">
          {/* Header Actions */}
          <div className="absolute right-2 top-2 flex items-center gap-2">
            <div className="flex space-x-2">
              {session?.user ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 transition-all duration-200",
                          "bg-white/90 dark:bg-black-main/90 shadow-sm",
                          prompt.isBookmarked ? "text-accent-purple border-accent-purple border" : "border border-light-grey hover:border-accent-purple/60",
                          isBookmarking && "animate-pulse")} 
                        onClick={toggleBookmark}
                        disabled={isBookmarking}
                      >
                        {prompt.isBookmarked ? (
                          <BookmarkCheck className={cn("h-4 w-4 text-accent-purple transition-transform", isBookmarking && "scale-110")} />
                        ) : (
                          <Bookmark className={cn("h-4 w-4 transition-transform", isBookmarking && "scale-110")} />
                        )}
                        <span className="sr-only">{prompt.isBookmarked ? t('removeBookmark') : t('bookmark')}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {prompt.isBookmarked ? t('removeBookmark') : t('bookmark')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 transition-all duration-200",
                          "bg-white/90 dark:bg-black-main/90 shadow-sm border border-light-grey")} 
                        onClick={() => {
                          onClose();  // Close modal first
                          router.push(`/${locale}/auth/login`);
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                        <span className="sr-only">{t('signInToBookmark')}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {t('signInToBookmark')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Badge and Title section */}
          <div className="mb-4 sm:mb-6">
            <div className="mb-3">
              {prompt.isPro ? (
                <Badge variant="purple" className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  <Crown className="h-3 w-3" />
                  {t('pro')}
                </Badge>
              ) : (
                <Badge variant="outline" className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  <Turtle className="h-3 w-3" />
                  {t('basic')}
                </Badge>
              )}
            </div>
            <h2 className={cn(
              "text-xl sm:text-2xl font-semibold",
              isRTL && "text-right"
            )}>
              {prompt.title}
            </h2>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
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
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
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
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {t('promptDescription')}
            </h3>
            <p className={cn(
              "text-base sm:text-sm leading-relaxed",
              isRTL && "text-right"
            )}>
              {prompt.description}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              <span>{t('copy')} {prompt.copyCount} {t('times')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{t('created')} {format(new Date(prompt.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {prompt.updatedAt !== prompt.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t('updated')} {format(new Date(prompt.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Prompt Text */}
          <Alert className="mb-4 sm:mb-6">
            <div className="relative">
              <ProPromptContent
                isPro={prompt.isPro}
                isUserSubscribed={userSubscriptionStatus === true}
                locale={locale}
                className="w-full"
              >
                <AlertDescription className="whitespace-pre-wrap font-mono text-sm pr-24">
                  {prompt.promptText}
                </AlertDescription>
                <Button
                  className={cn(
                    "absolute top-0 right-0 mt-2 mr-2 transition-all duration-200",
                    "h-10 sm:h-8", // Larger touch target on mobile
                    "min-w-[80px] sm:min-w-[60px]",
                    isCopied ? "border-accent-green text-accent-green" : "bg-accent-green text-black hover:bg-accent-green/90"
                  )}
                  variant={isCopied ? "outline" : "secondary"}
                  size="sm"
                  onClick={handleCopy}
                  disabled={prompt.isPro && userSubscriptionStatus === false && !showProToAll}
                >
                  {isCopied ? (
                    <CheckCircle className="h-3 w-3 mr-2" />
                  ) : (
                    <Copy className="h-3 w-3 mr-2" />
                  )}
                  {isCopied ? t('copied') : t('copy')}
                </Button>
              </ProPromptContent>
            </div>
          </Alert>

          {/* Instructions */}
          {prompt.instruction && (
            <Alert variant="default" className="mb-4 sm:mb-6">
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
