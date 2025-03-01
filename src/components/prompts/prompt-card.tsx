"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Heart, Copy, Share2 } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PromptCardProps {
  title: string
  description: string
  likes: number
  isLiked: boolean
  user: {
    name: string
    image?: string
  }
  onLike?: () => void
}

export function PromptCard({
  title,
  description,
  likes,
  isLiked,
  user,
  onLike,
}: PromptCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLike = async () => {
    if (!onLike) return

    try {
      setIsLoading(true)
      await onLike()
    } catch {
      toast({
        title: "Error",
        description: "Failed to like prompt",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(description)
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
        text: description,
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
            <Avatar>
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : (
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Link
                href={`/profile/${user.name}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                {user.name}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={isLoading || !onLike}
            >
              <Heart
                className={isLiked ? "fill-current text-red-500" : ""}
                size={20}
              />
              <span className="sr-only">Like</span>
            </Button>
            <span className="text-sm text-muted-foreground">{likes}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy size={20} />
            <span className="sr-only">Copy</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 size={20} />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
