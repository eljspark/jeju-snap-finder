export async function prerender() {
  return [{ url: '/' }];
}

export async function onBeforeRender() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  
  try {
    const json = readFileSync(join(process.cwd(), 'public', 'data', 'packages.json'), 'utf-8');
    const packagesData = JSON.parse(json);
    
    // Transform the data to match what the components expect
    const packages = packagesData.map((pkg: any) => ({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price_krw,
      duration: pkg.duration_minutes ? `${pkg.duration_minutes}분` : "촬영 시간 미정",
      occasions: pkg.occasions || [],
      images: [pkg.thumbnail_url || "/placeholder.svg"],
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
