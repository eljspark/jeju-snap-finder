import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThumbnailUrl(thumbnailUrl: string | null, supabaseClient?: any): string {
  console.log('🔧 formatThumbnailUrl input:', thumbnailUrl);
  
  if (!thumbnailUrl) {
    console.log('❌ No thumbnail URL provided, using placeholder');
    return "/placeholder.svg";
  }
  
  // If it's already a full URL, return as is
  if (thumbnailUrl.startsWith("http")) {
    console.log('✅ Full URL detected, passing through:', thumbnailUrl);
    return thumbnailUrl;
  }
  
  // Clean up path by removing leading slashes, fixing double slashes, and encoding spaces
  let cleanPath = thumbnailUrl
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/ /g, '%20');  // URL encode spaces
  
  console.log('🧹 Cleaned path:', cleanPath);
  
  // Remove 'packages/' prefix if it exists (since it's already in the base URL)
  if (cleanPath.startsWith('packages/')) {
    cleanPath = cleanPath.substring('packages/'.length);
    console.log('📦 Removed packages/ prefix, new path:', cleanPath);
  }
  
  // If it's just a storage path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
  const finalUrl = `${baseUrl}/${cleanPath}`;
  console.log('🎯 Final formatted URL:', finalUrl);
  
  return finalUrl;
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