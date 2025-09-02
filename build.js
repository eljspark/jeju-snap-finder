#!/usr/bin/env node

import { execSync } from 'child_process';
import { fetchPackages } from './scripts/fetch-data.js';

console.log('🚀 Starting SSG build process...\n');

try {
  // Step 1: Fetch data from Supabase
  console.log('📡 Step 1: Fetching data from Supabase...');
  await fetchPackages();
  console.log('✅ Data fetching complete!\n');

  // Step 2: Build the site with Vite
  console.log('🔨 Step 2: Building static site...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build complete!\n');

  console.log('🎉 SSG build finished successfully!');
  console.log('📄 Static HTML files generated with SEO-optimized content');
  console.log('🔍 Search engines will now see fully rendered pages');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}