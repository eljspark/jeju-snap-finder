import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ssr } from "vite-plugin-ssr/plugin";

// --- Custom plugin: fetch data before build ---
function ssgDataFetchPlugin() {
  return {
    name: "ssg-data-fetch",
    async buildStart() {
      console.log("🚀 Starting SSG build with data fetching...");
      try {
        // Import and run the data fetching script
        // @ts-ignore - JavaScript module without TypeScript declarations
        const fetchDataModule = await import("./scripts/fetch-data.js");
        const { fetchPackages } = fetchDataModule;
        console.log("📡 Fetching data from Supabase...");
        await fetchPackages();
        console.log("✅ Data fetching complete!");
      } catch (error) {
        console.error("❌ Data fetching failed:", error);
        console.warn("⚠️ Continuing build without fresh data...");
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ssgDataFetchPlugin(),          // fetch Supabase data at build start
    ssr({ prerender: true }),      // enable vite-plugin-ssr prerender
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
