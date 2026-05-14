import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vps from 'vite-plugin-ssr/plugin'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), vps({ prerender: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  ssr: {
    noExternal: ['vite-plugin-ssr'],
  },
})
