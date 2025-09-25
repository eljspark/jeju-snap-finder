export async function prerender() {
  return [{ url: '/' }];
}

export async function onBeforeRender() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  
  try {
    const json = readFileSync(join(process.cwd(), 'public', 'data', 'packages.json'), 'utf-8');
    const packages = JSON.parse(json);
    
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