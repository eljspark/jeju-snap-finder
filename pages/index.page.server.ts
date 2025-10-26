export async function prerender() {
  return [{ url: '/' }];
}

// Helper to format thumbnail URLs consistently
function formatThumbnailUrl(thumbnailUrl: string) {
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL, encode it properly
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    try {
      const urlObj = new URL(thumbnailUrl);
      const pathParts = urlObj.pathname.split('/');
      const encodedParts = pathParts.map(part => encodeURIComponent(decodeURIComponent(part)));
      urlObj.pathname = encodedParts.join('/');
      return urlObj.toString();
    } catch {
      return thumbnailUrl;
    }
  }
  
  // If it's a relative path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
  let cleanPath = thumbnailUrl.replace(/^\/+/, '');
  
  if (!cleanPath.startsWith('packages/')) {
    cleanPath = `packages/${cleanPath}`;
  }
  
  const pathParts = cleanPath.split('/');
  const encodedParts = pathParts.map(part => encodeURIComponent(part));
  return `${baseUrl}/${encodedParts.join('/')}`;
}

export async function onBeforeRender() {
  try {
    // Fetch directly from Supabase during build/render
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://cvuirhzznizztbtclieu.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM'
    );
    
    const { data: packagesData, error } = await supabase.from('packages').select('*');
    
    if (error) {
      console.error('Failed to fetch packages from Supabase:', error);
      return {
        pageContext: {
          pageProps: {
            packages: []
          }
        }
      };
    }
    
    // Transform the data to match what the components expect
    const packages = (packagesData || []).map((pkg: any) => ({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price_krw,
      duration: pkg.duration_minutes ? `${pkg.duration_minutes}분` : "촬영 시간 미정",
      occasions: pkg.occasions || [],
      images: [formatThumbnailUrl(pkg.thumbnail_url)],
      featured: pkg.featured || false,
    }));
    
    return {
      pageContext: {
        pageProps: {
          packages
        }
      }
    };
  } catch (error) {
    console.error('Failed to load packages:', error);
    return {
      pageContext: {
        pageProps: {
          packages: []
        }
      }
    };
  }
}
