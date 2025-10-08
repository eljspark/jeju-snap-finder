/ scripts/fetch-data.js  (CommonJS)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

(async () => {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[fetch-data] Missing Supabase env vars; skipping data fetch.');
    process.exit(0);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: packages, error } = await supabase
    .from('packages')
    .select('*');

  if (error) {
    console.error('[fetch-data] Supabase error:', error);
    process.exit(0); // don't fail the build
  }

  const outDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'packages.json'),
    JSON.stringify(packages || [], null, 2)
  );

  for (const p of packages || []) {
    fs.writeFileSync(
      path.join(outDir, `package-${p.id}.json`),
      JSON.stringify(p, null, 2)
    );
  }

  console.log(`[fetch-data] Wrote static JSON for ${(packages || []).length} packages`);
})();
