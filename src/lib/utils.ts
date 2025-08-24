import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThumbnailUrl(thumbnailUrl: string | null): string {
  if (!thumbnailUrl) return "/placeholder.svg"
  
  // If it's already a full URL, return as is
  if (thumbnailUrl.startsWith("http")) {
    return thumbnailUrl
  }
  
  // If it's just a storage path, convert to full URL
  const { data } = supabase.storage
    .from('packages')
    .getPublicUrl(thumbnailUrl)
    
  return data.publicUrl
}
