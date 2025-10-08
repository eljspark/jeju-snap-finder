mport fs from 'fs';
import path from 'path';

const baseUrl = 'https://jejusnapfinder.com';
const dataPath = path.join(process.cwd(), 'public', 'data');

// Find all JSON files that start with "package-"
const files = fs.readdirSync(dataPath).filter(f => f.startsWith('package-') && f.endsWith('.json'));

// Build <url> entries for each package
const urls = files.map(file => {
  const id = file.replace('package-', '').replace('.json', '');
  return `
  <url>
    <loc>${baseUrl}/packages/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
});

// Add homepage + static pages manually
const staticPages = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
].map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

// Combine everything
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.join('\n')}
  ${urls.join('\n')}
</urlset>`;

// Write sitemap.xml into /public
fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
console.log('✅ sitemap.xml generated successfully');
