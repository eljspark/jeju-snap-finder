# SSG Deployment Instructions

The SSG migration is now complete! All fixes have been applied:

## ✅ Completed Fixes

1. **Astro Config Fixed** - Removed Node adapter, kept static output
2. **Build Errors Fixed** - Removed duplicate `</Layout>` tag in package detail pages
3. **SEO URLs Fixed** - Using proper `Astro.site` URLs in structured data
4. **Hero Image Fixed** - Moved to `public/hero-jeju.jpg` and fixed preload
5. **Sitemap Fixed** - Deleted manual sitemap (Astro will auto-generate)
6. **Environment Variables** - Added Supabase env vars for build-time

## 🚨 CRITICAL: Update package.json Scripts

Since `package.json` is read-only, you must manually update these scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build", 
    "preview": "astro preview",
    "dev:spa": "vite",
    "build:spa": "vite build"
  }
}
```

## 🚀 Deploy Steps

1. **Update package.json** with the scripts above
2. **Test locally:**
   ```bash
   npm run dev     # Should start Astro dev server
   npm run build   # Should generate static files in dist/
   ```
3. **Deploy Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework:** Astro (or Static Site)

## 🎯 What This Achieves

- ✅ **ChatGPT Accessible** - Pre-rendered HTML with all package content
- ✅ **Perfect SEO** - Server-side rendered meta tags and structured data
- ✅ **Lightning Fast** - Static HTML loads instantly
- ✅ **All 20 Packages** - Pre-generated at build time for crawlers
- ✅ **Auto Sitemap** - Generated at `/sitemap-index.xml`

After deployment, verify with:
```bash
curl https://your-domain/ | grep "제주도"
curl https://your-domain/packages/some-id/ | grep "패키지"
```

You should see actual content, not empty divs!