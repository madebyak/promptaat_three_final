'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  style?: React.CSSProperties
}

/**
 * SEO-optimized image component that implements best practices
 * Uses Next.js Image with proper loading attributes and size optimization
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 80,
  style,
  ...props
}: OptimizedImageProps & Omit<React.HTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height' | 'loading' | 'style'>) {
  // If no sizes prop is provided but fill is true, provide a responsive default
  const defaultSizes = fill && !sizes 
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' 
    : sizes
  
  return (
    <div className={cn("relative", className)} style={style}>
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        quality={quality}
        priority={priority}
        sizes={defaultSizes}
        loading={priority ? 'eager' : 'lazy'}
        className={cn(
          "transition-opacity duration-300",
          fill ? "object-cover" : ""
        )}
        {...props}
      />
    </div>
  )
}
