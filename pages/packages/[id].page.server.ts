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