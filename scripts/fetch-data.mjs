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

async function main() {
  const { data, error } = await supabase.from('packages').select('*');
  if (error) throw error;

  const outDir = path.join(process.cwd(), 'public', 'data');
  await fs.mkdir(outDir, { recursive: true });

  // index
  await fs.writeFile(
    path.join(outDir, 'packages.json'),
    JSON.stringify(data || [], null, 2),
    'utf8'
  );

  // detail JSON per package (optional)
  for (const pkg of data || []) {
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
