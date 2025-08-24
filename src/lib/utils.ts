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
