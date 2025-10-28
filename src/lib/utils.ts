import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThumbnailUrl(thumbnailUrl: string | null | undefined, supabaseClient?: any): string {
  // Return placeholder if no URL provided
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    return "/placeholder.svg"
  }
  
  // If it's already a full URL, return as-is
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl
  }
  
  // If it's just a storage path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
  
  // Clean up path to prevent double slashes
  let cleanPath = thumbnailUrl.replace(/^\/+/, ''); // Remove leading slashes
  
  // If path doesn't start with 'packages/', add it
  if (!cleanPath.startsWith('packages/')) {
    cleanPath = `packages/${cleanPath}`;
  }
  
  return `${baseUrl}/${cleanPath}`;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) {
    return "촬영 시간 미정"
  }
  
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
