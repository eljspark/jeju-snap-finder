export async function prerender() {
  const { readdirSync, readFileSync } = await import('fs');
  const { join } = await import('path');
  try {
    const dir = join(process.cwd(), 'public', 'data');
    const files = readdirSync(dir).filter(f => f.startsWith('package-') && f.endsWith('.json'));
    return files.map(f => {
      const pkg = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
      return { url: `/packages/${pkg.id}` };
    });
  } catch {
    return [];
  }
}

export async function onBeforeRender(pageContext: any) {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  
  const packageId = pageContext.routeParams.id;
  
  try {
    // Try to load static package data
    const packagePath = join(process.cwd(), 'public', 'data', `package-${packageId}.json`);
    const packageData = JSON.parse(readFileSync(packagePath, 'utf-8'));
    
    return {
      pageContext: {
        pageProps: {
          packageData,
          packageId,
        }
      }
    };
  } catch (error) {
    // If static data doesn't exist, just pass the ID
    return {
      pageContext: {
        pageProps: {
          packageId,
        }
      }
    };
  }
}