export async function prerender() {
  return [{ url: '/' }];
}

export async function onBeforeRender() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  
  try {
    // Load all packages for the homepage
    const packagesPath = join(process.cwd(), 'public', 'data', 'packages.json');
    const packages = JSON.parse(readFileSync(packagesPath, 'utf-8'));
    
    return {
      pageContext: {
        pageProps: {
          packages,
        }
      }
    };
  } catch (error) {
    return {
      pageContext: {
        pageProps: {
          packages: [],
        }
      }
    };
  }
}