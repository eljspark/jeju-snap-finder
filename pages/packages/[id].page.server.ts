import { createClient } from '@supabase/supabase-js';
import { buildPackageSlugs, findPackageBySlugOrId } from '../../src/lib/packageSlug.js';

// Helper to get Supabase client for server-side data fetching
function getSupabaseClient() {
  return createClient(
    'https://cvuirhzznizztbtclieu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM'
  );
}

export async function prerender() {
  // Fetch all packages from Supabase directly during prerender
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('packages').select('*');
  
  if (error || !data) {
    console.error('Failed to fetch packages for prerender:', error);
    return [];
  }
  
  console.log(`Prerendering ${data.length} package pages...`);
  return buildPackageSlugs(data).map(pkg => ({ url: `/packages/${pkg.package_slug}` }));
}

export async function onBeforeRender(pageContext) {
  const slugOrId = pageContext.routeParams.id;
  
  // Fetch package data directly from Supabase during SSG. Readable slugs are
  // derived from package titles, while UUID URLs remain supported as fallbacks.
  const supabase = getSupabaseClient();
  const { data: packages, error: allError } = await supabase
    .from('packages')
    .select('*');
  const packagesWithSlugs = buildPackageSlugs(packages || []);
  const packageData = findPackageBySlugOrId(packagesWithSlugs, slugOrId);
  
  if (allError || !packageData) {
    console.error('Package data not found for', slugOrId, allError);
    return {
      pageContext: {
        pageProps: {
          packageData: null,
          packages: packagesWithSlugs,
          packageId: slugOrId
        }
      }
    };
  }
  
  // Format thumbnail URL if needed
  const formatThumbnailUrl = (url) => {
    if (!url || url.trim() === '') return "/placeholder.svg";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public";
    let cleanPath = url.replace(/^\/+/, '');
    if (!cleanPath.startsWith('packages/')) cleanPath = `packages/${cleanPath}`;
    return `${baseUrl}/${cleanPath}`;
  };

  const formattedPackageData = {
    ...packageData,
    thumbnail_url: formatThumbnailUrl(packageData.thumbnail_url)
  };

  const formattedPackages = packagesWithSlugs.map(pkg => ({
    ...pkg,
    thumbnail_url: formatThumbnailUrl(pkg.thumbnail_url)
  }));

  return {
    pageContext: {
      pageProps: {
        packageData: formattedPackageData,
        packages: formattedPackages,
        packageId: packageData.id
      }
    }
  };
}
