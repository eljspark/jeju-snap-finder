// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vps from 'vite-plugin-ssr/plugin'

// ✅ ESM-safe imports for path + __dirname
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(async () => {
  const plugins = [react(), vps({ prerender: true })]

  // Try to load lovable-tagger only when it exists (e.g. in Lovable)
  try {
    const mod = await import('lovable-tagger')
    if (mod?.default) {
      plugins.push(mod.default())
    } else if (typeof mod === 'function') {
      // in case it exports a function directly
      // @ts-ignore
      plugins.push(mod())
    }
  } catch {
    // Not running in Lovable — ignore missing package
    console.log('Skipping lovable-tagger (not installed).')
  }

  return {
    plugins,
   resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
    build: {
      outDir: 'dist/client',
    },
    ssr: {
      noExternal: ['vite-plugin-ssr']
    }
  }
})
