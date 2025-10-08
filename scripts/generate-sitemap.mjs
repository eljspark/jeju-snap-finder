// scripts/generate-sitemap.js  (CommonJS)
const fs = require('fs');
const path = require('path');

const SITE = process.env.SITE_URL || 'https://jejusnapfinder.com';

function getPackageIds() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith('package-') && f.endsWith('.json'));
    return files.map(f => f.slice('package-'.length, -'.json'.length));
  } catch {
    return [];
  }
}

function makeUrl({ loc, changefreq, priority }) {
  return `  <url>
    <loc>${loc}</loc>
    ${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}
    ${priority ? `<priority>${priority}</priority>` : ''}
  </url>`;
}

const urls = [
  { loc: `${SITE}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${SITE}/privacy`, changefreq: 'yearly', priority: '0.5' },
  { loc: `${SITE}/terms`, changefreq: 'yearly', priority: '0.5' },
  { loc: `${SITE}/contact`, changefreq: 'yearly', priority: '0.5' },
  { loc: `${SITE}/about`, changefreq: 'yearly', priority: '0.5' },
  ...getPackageIds().map(id => ({
    loc: `${SITE}/packages/${id}`,
    changefreq: 'weekly',
    priority: '0.8'
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(makeUrl).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml);
console.log(`[sitemap] Generated ${urls.length} URLs`);
