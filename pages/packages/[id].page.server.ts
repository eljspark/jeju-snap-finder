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

export async function onBeforeRender(pageContext) {
  const { id } = pageContext.routeParams;
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  
  try {
    const packageJson = readFileSync(join(process.cwd(), 'public', 'data', `package-${id}.json`), 'utf-8');
    const packageData = JSON.parse(packageJson);
    const packagesJson = readFileSync(join(process.cwd(), 'public', 'data', 'packages.json'), 'utf-8');
    const packages = JSON.parse(packagesJson);
    
    return {
      pageContext: {
        pageProps: {
          packageData: {
            ...packageData,
            description: packageData.details
          },
          packages,
          packageId: id
        }
      }
    };
  } catch (error) {
    console.error('Package data not found for', id);
    return {
      pageContext: {
        pageProps: {
          packageData: null,
          packages: [],
          packageId: id
        }
      }
    };
  }
}