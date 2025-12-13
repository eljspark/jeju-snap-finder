import fs from 'node:fs/promises';
import path from 'node:path';

const SITE = process.env.SITE_ORIGIN || 'https://jejusnapfinder.com';

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
          .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
}

async function main() {
  // Read the packages from individual JSON files (same approach as SSG)
  const dataDir = path.join(process.cwd(), 'public', 'data');
  let packages = [];
  
  try {
    // First try packages.json
    const packagesPath = path.join(dataDir, 'packages.json');
    const raw = await fs.readFile(packagesPath, 'utf8');
    packages = JSON.parse(raw);
  } catch {
    // Fallback: read individual package-*.json files
    try {
      const files = await fs.readdir(dataDir);
      const packageFiles = files.filter(f => f.startsWith('package-') && f.endsWith('.json'));
      
      for (const file of packageFiles) {
        try {
          const content = await fs.readFile(path.join(dataDir, file), 'utf8');
          const pkg = JSON.parse(content);
          packages.push(pkg);
        } catch (e) {
          console.warn(`Warning: Could not read ${file}`, e.message);
        }
      }
    } catch {
      packages = [];
    }
  }

  const urls = [
    { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${SITE}/packages`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE}/privacy`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/terms`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/about`, changefreq: 'yearly', priority: '0.3' },
    { loc: `${SITE}/contact`, changefreq: 'yearly', priority: '0.3' }
  ];

  for (const p of packages) {
    urls.push({
      loc: `${SITE}/packages/${encodeURIComponent(p.id)}`,
      changefreq: 'weekly',
      priority: '0.7'
    });
  }

  const body = urls.map(u => `
  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

  const outFile = path.join(process.cwd(), 'public', 'sitemap.xml');
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, xml, 'utf8');

  // robots.txt (optional but recommended)
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
  await fs.writeFile(path.join(process.cwd(), 'public', 'robots.txt'), robots, 'utf8');

  console.log('✔ Generated sitemap.xml and robots.txt');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
