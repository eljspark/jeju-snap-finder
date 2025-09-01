import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://snapfinder-jeju.com', // Update with your actual domain
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We have our own base styles in index.css
    }),
    sitemap()
  ],
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  }
});