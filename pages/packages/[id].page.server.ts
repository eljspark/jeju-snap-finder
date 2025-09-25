export async function prerender() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  try {
    const json = readFileSync(join(process.cwd(), 'public', 'data', 'packages.json'), 'utf-8');
    const packages = JSON.parse(json);
    return packages.map((p) => ({ id: p.id }));
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
          packageData,
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