import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThumbnailUrl(thumbnailUrl: string | null, supabaseClient?: any): string {
  if (!thumbnailUrl) return "/placeholder.svg"
  
  // If it's already a full URL, return as is
  if (thumbnailUrl.startsWith("http")) {
    return thumbnailUrl
  }
  
  // If it's just a storage path, convert to full URL
  // Using the direct public URL format instead of client call
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
  return `${baseUrl}/${thumbnailUrl}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
}
