import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ssr } from "vite-plugin-ssr/plugin";
import { execSync } from "node:child_process";

// --- Custom plugin: fetch data before build ---
function ssgDataFetchPlugin() {
  return {
    name: "ssg-data-fetch",
    async buildStart() {
      console.log("🚀 Starting SSG build with data fetching...");
      try {
        // Import and run the data fetching script
        const fetchDataModule = await import("./scripts/fetch-data.js");
        const { fetchPackages } = fetchDataModule as {
          fetchPackages: () => Promise<void>;
        };
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

// --- Custom plugin: ensure SSR + prerender runs after build ---
function ssgPrerenderPlugin() {
  return {
    name: "ssg-prerender",
    apply: "build",
    closeBundle() {
      console.log("🛠 Running SSR build + prerender...");
      try {
        // Step 1: build server bundle
        execSync("vite build --ssr", { stdio: "inherit" });

        // Step 2: prerender all routes into dist/
        execSync("npx vite-plugin-ssr prerender", { stdio: "inherit" });

        console.log("✅ Prerender complete!");
      } catch (error) {
        console.error("❌ Prerender failed:", error);
      }
    },
  };
}

// --- Main config ---
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    ssgDataFetchPlugin(),          // fetch Supabase data at build start
    ssr({ prerender: true }),      // enable vite-plugin-ssr prerender
    ssgPrerenderPlugin(),          // run SSR build + prerender after vite build
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

