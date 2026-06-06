import { createClient } from '@supabase/supabase-js';
import { buildPackageSlugs } from '../../src/lib/packageSlug.js';
import { OCCASION_EN_TO_KO, getVisibleOccasionSlugs, isOccasionVisible } from '../../src/lib/occasionCategories.js';

function getSupabaseClient() {
  return createClient(
    'https://cvuirhzznizztbtclieu.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM'
  );
}

function formatThumbnailUrl(url: string | null | undefined) {
  if (!url || url.trim() === '') return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public";
  let cleanPath = url.replace(/^\/+/, '');
  if (!cleanPath.startsWith('packages/')) cleanPath = `packages/${cleanPath}`;
  return `${baseUrl}/${cleanPath}`;
}

export async function prerender() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('packages').select('*');

  if (error || !data) {
    console.error('Failed to fetch packages for category prerender:', error);
    return getVisibleOccasionSlugs([]).map((slug) => ({ url: `/category/${slug}` }));
  }

  return getVisibleOccasionSlugs(buildPackageSlugs(data)).map((slug) => ({ url: `/category/${slug}` }));
}

export async function onBeforeRender(pageContext: any) {
  const occasionSlug = pageContext.routeParams.occasion as string;
  const occasionKo = OCCASION_EN_TO_KO[occasionSlug];

  if (!occasionKo) {
    // Unknown slug → return empty packages
    return {
      pageContext: {
        pageProps: {
          packages: [],
          occasionFilter: null,
        },
      },
    };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('packages').select('*');

  if (error || !data) {
    console.error('Failed to fetch packages for category prerender:', error);
    return {
      pageContext: {
        pageProps: {
          packages: [],
          occasionFilter: occasionKo,
        },
      },
    };
  }

  // Filter packages whose `occasions` array contains the requested occasion
  const packagesWithSlugs = buildPackageSlugs(data);
  if (!isOccasionVisible(packagesWithSlugs, occasionKo)) {
    return {
      pageContext: {
        pageProps: {
          packages: [],
          occasionFilter: null,
        },
      },
    };
  }

  const filtered = packagesWithSlugs
    .filter((pkg: any) => Array.isArray(pkg.occasions) && pkg.occasions.includes(occasionKo))
    .map((pkg: any) => ({
      ...pkg,
      thumbnail_url: formatThumbnailUrl(pkg.thumbnail_url),
    }));

  return {
    pageContext: {
      pageProps: {
        packages: filtered,
        occasionFilter: occasionKo,
      },
    },
  };
}
