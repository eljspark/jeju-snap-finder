import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init Supabase (read from env on Vercel / .env locally)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

// Helper to format thumbnail URLs consistently
function formatThumbnailUrl(thumbnailUrl) {
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL, return as-is
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl;
  }
  
  // If it's a relative path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages";
  let cleanPath = thumbnailUrl.replace(/^\/+/, '');
  
  if (!cleanPath.startsWith('packages/')) {
    cleanPath = `packages/${cleanPath}`;
  }
  
  return `${baseUrl}/${cleanPath}`;
}

async function main() {
  const { data, error } = await supabase.from('packages').select('*');
  if (error) throw error;

  const outDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(outDir, { recursive: true });

  // Format thumbnail URLs for all packages
  const formattedData = (data || []).map(pkg => ({
    ...pkg,
    thumbnail_url: formatThumbnailUrl(pkg.thumbnail_url),
    images: pkg.images?.map(img => formatThumbnailUrl(img)) || [formatThumbnailUrl(pkg.thumbnail_url)]
  }));

  // index
  await fs.writeFile(
    path.join(outDir, 'packages.json'),
    JSON.stringify(formattedData, null, 2),
    'utf8'
  );

  // detail JSON per package (optional)
  for (const pkg of formattedData) {
    await fs.writeFile(
      path.join(outDir, `package-${pkg.id}.json`),
      JSON.stringify(pkg, null, 2),
      'utf8'
    );
  }

  console.log('✔ Fetched packages & wrote static JSON');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
