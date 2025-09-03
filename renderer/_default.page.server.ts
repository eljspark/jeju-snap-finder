import ReactDOMServer from 'react-dom/server';
import React from 'react';
import pkg from 'react-router-dom';
const { StaticRouter } = pkg;
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server';
import type { PageContextServer } from 'vite-plugin-ssr/types';
import { readFileSync } from 'fs';
import { join } from 'path';

export { render };
export { passToClient };

const passToClient = ['pageProps', 'urlPathname', 'packageData'];

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;
  
  // Get static data based on route
  const staticData = getStaticData(pageContext.urlPathname);
  
  const pageHtml = ReactDOMServer.renderToString(
    React.createElement(StaticRouter, { location: pageContext.urlOriginal }, 
      React.createElement(Page, { pageProps, ...staticData })
    )
  );

  // Generate meta tags based on page and data
  const { title, description, ogImage, structuredData } = generateMetaTags(
    pageContext.urlPathname, 
    staticData
  );

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        
        <!-- Open Graph -->
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:type" content="website" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImage}" />
        
        <!-- Structured Data -->
        ${structuredData ? dangerouslySkipEscape(`<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`) : ''}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
        <script>
          window.__STATIC_DATA__ = ${dangerouslySkipEscape(JSON.stringify(staticData))};
        </script>
      </body>
    </html>`;

  return {
    documentHtml
  };
}

function getStaticData(urlPathname: string) {
  try {
    // Import server-only modules inside function to avoid client bundle inclusion
    const { readFileSync } = require('fs');
    const { join } = require('path');
    
    const dataPath = join(process.cwd(), 'public', 'data');
    
    if (urlPathname === '/') {
      try {
        const packagesData = readFileSync(join(dataPath, 'packages.json'), 'utf-8');
        return { packages: JSON.parse(packagesData) };
      } catch (error) {
        console.warn('Packages data not found, using empty array');
        return { packages: [] };
      }
    }
    
    const packageMatch = urlPathname.match(/^\/packages\/(.+)$/);
    if (packageMatch) {
      const packageId = packageMatch[1];
      try {
        const packageData = readFileSync(join(dataPath, `package-${packageId}.json`), 'utf-8');
        return { packageData: JSON.parse(packageData) };
      } catch (error) {
        console.warn(`Package data not found for ${packageId}`);
        return { packageData: null };
      }
    }
    
    return {};
  } catch (error) {
    console.warn(`Could not load static data for ${urlPathname}:`, error);
    return {};
  }
}

function generateMetaTags(urlPathname: string, staticData: any) {
  // Default meta
  let title = "제주 인기스냅들을 한눈에! | 제주도 사진촬영 패키지";
  let description = "인스타, 네이버에는 웨딩스냅만 많아서 커플스냅, 가족스냅을 찾기 힘들었다면? 제가 대신 한곳에 모아드렸어요!";
  let ogImage = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/hero-jeju.jpg";
  let structuredData = null;

  if (urlPathname === '/' && staticData.packages) {
    // Homepage structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": "https://yoursite.com/",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": staticData.packages.slice(0, 10).map((pkg: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Service",
            "name": pkg.title,
            "description": pkg.details || "제주도 사진촬영 서비스",
            "offers": {
              "@type": "Offer",
              "price": pkg.price,
              "priceCurrency": "KRW"
            }
          }
        }))
      }
    };
  }

  if (staticData.packageData) {
    const pkg = staticData.packageData;
    title = `${pkg.title} | 제주도 사진촬영`;
    description = pkg.details || `${pkg.title} - 제주도 사진촬영 패키지. 가격: ${pkg.price.toLocaleString()}원`;
    ogImage = pkg.thumbnail_url || ogImage;

    // Package structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": pkg.title,
      "description": pkg.details || "제주도 사진촬영 서비스",
      "image": pkg.thumbnail_url,
      "offers": {
        "@type": "Offer",
        "price": pkg.price,
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock"
      },
      "provider": {
        "@type": "Organization",
        "name": "제주 스냅 서비스"
      }
    };
  }

  return { title, description, ogImage, structuredData };
}