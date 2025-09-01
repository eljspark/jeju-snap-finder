import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { formatThumbnailUrl, formatDuration } from './utils';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://cvuirhzznizztbtclieu.supabase.co';
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM';

// Create Supabase client for build-time data fetching
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface PackageData {
  id: string;
  title: string;
  price: number;
  duration: string;
  occasions: string[];
  images: string[];
  reservationUrl: string;
  folderPath: string | null;
  thumbnailUrl: string;
  details: string | null;
  sampleImageUrls: string[] | null;
}

export async function getAllPackages(): Promise<PackageData[]> {
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*');

  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }

  if (!packages) {
    return [];
  }

  return packages.map(pkg => ({
    id: pkg.id,
    title: pkg.title,
    price: pkg.price_krw,
    duration: formatDuration(pkg.duration_minutes || 0),
    occasions: pkg.occasions || [],
    images: pkg.sample_image_urls || [],
    reservationUrl: pkg.reservation_url,
    folderPath: pkg.folder_path,
    thumbnailUrl: formatThumbnailUrl(pkg.thumbnail_url),
    details: pkg.details,
    sampleImageUrls: pkg.sample_image_urls
  }));
}

export async function getPackageById(id: string): Promise<PackageData | null> {
  const { data: pkg, error } = await supabase
    .from('packages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !pkg) {
    console.error('Error fetching package:', error);
    return null;
  }

  return {
    id: pkg.id,
    title: pkg.title,
    price: pkg.price_krw,
    duration: formatDuration(pkg.duration_minutes || 0),
    occasions: pkg.occasions || [],
    images: pkg.sample_image_urls || [],
    reservationUrl: pkg.reservation_url,
    folderPath: pkg.folder_path,
    thumbnailUrl: formatThumbnailUrl(pkg.thumbnail_url),
    details: pkg.details,
    sampleImageUrls: pkg.sample_image_urls
  };
}

export async function getPackageImages(folderPath: string): Promise<{ name: string; url: string }[]> {
  if (!folderPath) return [];

  try {
    const { data: files, error } = await supabase.storage
      .from('packages')
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error || !files) {
      console.error('Error fetching images:', error);
      return [];
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const imageFiles = files.filter(file => 
      imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    return await Promise.all(
      imageFiles.map(async (file) => {
        const { data: publicUrl } = supabase.storage
          .from('packages')
          .getPublicUrl(`${folderPath}/${file.name}`);
        
        return {
          name: file.name,
          url: publicUrl.publicUrl
        };
      })
    );
  } catch (error) {
    console.error('Error in getPackageImages:', error);
    return [];
  }
}