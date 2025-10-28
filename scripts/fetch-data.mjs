import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init Supabase with hardcoded credentials (since env vars aren't available during build)
const supabase = createClient(
  'https://cvuirhzznizztbtclieu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM'
);

// Helper to format thumbnail URLs consistently
function formatThumbnailUrl(thumbnailUrl) {
  if (!thumbnailUrl || thumbnailUrl.trim() === '') {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL, fix double /packages/packages/ if present
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl.replace('/packages/packages/', '/packages/');
  }
  
  // If it's a relative path, convert to full URL
  const baseUrl = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public";
  let cleanPath = thumbnailUrl.replace(/^\/+/, '');
  
  if (!cleanPath.startsWith('packages/')) {
    cleanPath = `packages/${cleanPath}`;
  }
  
  return `${baseUrl}/${cleanPath}`;
}

export async function fetchPackages() {
  console.log('🔄 Fetching packages from Supabase...');
  const { data, error } = await supabase.from('packages').select('*');
  if (error) {
    console.error('❌ Error fetching packages:', error);
    throw error;
  }
  console.log(`✅ Fetched ${data?.length || 0} packages from database`);

  const outDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(outDir, { recursive: true });

  // Format thumbnail URLs for all packages
  const formattedData = (data || []).map(pkg => ({
    ...pkg,
    thumbnail_url: formatThumbnailUrl(pkg.thumbnail_url),
    images: pkg.images?.map(img => formatThumbnailUrl(img)) || [formatThumbnailUrl(pkg.thumbnail_url)]
  }));

  // index
  console.log(`📝 Writing packages.json with ${formattedData.length} packages...`);
  await fs.writeFile(
    path.join(outDir, 'packages.json'),
    JSON.stringify(formattedData, null, 2),
    'utf8'
  );
  console.log('✅ packages.json written successfully');

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

// Run directly if this file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchPackages().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
