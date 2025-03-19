import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return "N/A"
  
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "MMM d, yyyy")
}

/**
 * Creates an absolute URL from a relative path
 * Used for API routes that need full URLs (like Stripe redirects)
 */
export function absoluteUrl(path: string): string {
  // Use NEXT_PUBLIC_APP_URL from env if available, otherwise fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
