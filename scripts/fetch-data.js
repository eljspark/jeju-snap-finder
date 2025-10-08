import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node.fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://cvuirhzznizztbtclieu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function formatThumbnailUrl(url) {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  return `${SUPABASE_URL}/storage/v1/object/public/packages/${url}`;
}

function formatDuration(minutes) {
  if (!minutes) return "촬영 시간 미정";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes}분`;
  if (remainingMinutes === 0) return `${hours}시간`;
  return `${hours}시간 ${remainingMinutes}분`;
}

async function fetchPackages() {
  console.log('Fetching packages from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*');
    
    if (error) throw error;
    
    const packages = data.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      price: pkg.price_krw,
      duration: pkg.duration_minutes ? formatDuration(pkg.duration_minutes) : "촬영 시간 미정",
      occasions: pkg.occasions || ["Photography"],
      images: [formatThumbnailUrl(pkg.thumbnail_url)],
      thumbnail_url: formatThumbnailUrl(pkg.thumbnail_url),
      details: pkg.details,
      reservation_url: pkg.reservation_url,
      sample_image_urls: pkg.sample_image_urls || [],
      folder_path: pkg.folder_path,
      featured: false,
    }));

    // Create public/data directory if it doesn't exist
    const dataDir = join(__dirname, '..', 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Write all packages data
    writeFileSync(
      join(dataDir, 'packages.json'), 
      JSON.stringify(packages, null, 2)
    );

    // Write individual package files and generate route manifest
    const routes = ['/'];
    
    for (const pkg of packages) {
      writeFileSync(
        join(dataDir, `package-${pkg.id}.json`), 
        JSON.stringify(pkg, null, 2)
      );
      routes.push(`/packages/${pkg.id}`);
    }

    // Write routes manifest for SSG
    writeFileSync(
      join(dataDir, 'routes.json'), 
      JSON.stringify(routes, null, 2)
    );

    console.log(`✅ Fetched ${packages.length} packages and generated ${routes.length} routes`);
    return packages;

  } catch (error) {
    console.error('❌ Error fetching packages:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchPackages();
}

export { fetchPackages };
