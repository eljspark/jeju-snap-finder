import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function formatThumbnailUrl(
  thumbnailUrl: string | null | undefined, 
  transform?: ImageTransformOptions
): string {
  // Return placeholder if no URL provided
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    return "/placeholder.svg"
  }
  
  let fullUrl: string;
  
  // If it's already a full URL, use as-is
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    fullUrl = thumbnailUrl;
  } else {
    // If it's just a storage path, convert to full URL
    // Use /render/image/ endpoint for transformations instead of /object/public/
    const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
    
    // Clean up path to prevent double slashes
    let cleanPath = thumbnailUrl.replace(/^\/+/, '');
    
    if (!cleanPath.startsWith('packages/')) {
      cleanPath = `packages/${cleanPath}`;
    }
    
    fullUrl = `${baseUrl}/${cleanPath}`;
  }
  
  // Append Supabase image transformation query params
  if (transform && (transform.width || transform.height || transform.quality)) {
    // Supabase uses /render/image/ path for transformations
    // Replace /object/public/ with /render/image/public/ for transform support
    if (fullUrl.includes('/storage/v1/object/public/')) {
      fullUrl = fullUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    }
    
    const params = new URLSearchParams();
    if (transform.width) params.set('width', String(transform.width));
    if (transform.height) params.set('height', String(transform.height));
    if (transform.quality) params.set('quality', String(transform.quality));
    params.set('resize', 'contain');
    
    fullUrl += `?${params.toString()}`;
  }
  
  return fullUrl;
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
