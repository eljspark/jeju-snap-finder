export async function prerender() {
  const { readFileSync } = await import('fs');
  const { join } = await import('path');
  try {
    const json = readFileSync(join(process.cwd(), 'public', 'data', 'packages.json'), 'utf-8');
    const ids = JSON.parse(json).map((p) => p.id);
    return ids.map((id) => `/packages/${id}`);
  } catch {
    return [];
  }
}