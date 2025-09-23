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
  
  // Clean up path by removing leading slashes, fixing double slashes, and encoding spaces
  let cleanPath = thumbnailUrl
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/ /g, '%20')  // URL encode spaces
  
  // Remove 'packages/' prefix if it exists (since it's already in the base URL)
  if (cleanPath.startsWith('packages/')) {
    cleanPath = cleanPath.substring('packages/'.length)
  }
  
  // If it's just a storage path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages"
  return `${baseUrl}/${cleanPath}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}시간`
  }
  
  return `${hours}시간 ${remainingMinutes}분`
}