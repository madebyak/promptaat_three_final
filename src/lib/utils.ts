import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cnWithCondition(condition: boolean, ...inputs: ClassValue[]) {
  return condition ? cn(...inputs) : ''
}

export function cnWithArrayCondition(conditionArray: boolean[], ...inputs: ClassValue[]) {
  return conditionArray.every(Boolean) ? cn(...inputs) : ''
}

/**
 * Format a date string into a human-readable format
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions to customize the format
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }
) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Format a date string to show relative time (e.g., "2 days ago")
 * @param dateString - The date string to format
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string | Date) {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  
  // Default to standard date format
  return formatDate(date);
}

/**
 * Generates an absolute URL for the application
 * @param path - The path to append to the base URL
 * @returns The absolute URL
 */
export function absoluteUrl(path: string) {
  // Use NEXT_PUBLIC_APP_URL from environment if available, otherwise fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${baseUrl}${path}`;
}
