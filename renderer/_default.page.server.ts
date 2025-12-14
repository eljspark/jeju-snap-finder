import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server';
import type { PageContextServer } from 'vite-plugin-ssr/types';
import '../src/index.css';

export { render };
export { passToClient };

const passToClient = ['pageProps', 'urlPathname', 'packageData'];

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext;
  
  // Get static data based on route
  const staticData = getStaticData(pageContext.urlPathname);
  
  const pageHtml = ReactDOMServer.renderToString(
    React.createElement(Page, { pageProps, ...staticData })
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

          <!-- Google AdSense (global) -->
        ${dangerouslySkipEscape(
          import.meta.env.PROD
            ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433360229161618" crossorigin="anonymous"></script>`
            : ''
        )}
        
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
        
        <!-- Naver Site Verification -->
        <meta name="naver-site-verification" content="e6c43980d7aadfed027fc5e211b84ec7bb5749bd" />
        
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

async function getStaticData(urlPathname: string) {
  try {
    // Use dynamic imports to avoid client bundle inclusion
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    
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
  let title = "제주 스냅 촬영 비교 - 커플, 가족, 만삭 스냅 패키지 총정리 | 제주스냅파인더";
  let description = "제주도 커플스냅, 가족스냅, 만삭스냅 작가님들을 가격별, 유형별로 쉽게 비교하고 찾을 수 있어요.";
  let ogImage = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/hero-jeju.jpg";
  let structuredData = null;

  if (urlPathname === '/' && staticData.packages) {
    // Homepage structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": "https://jejusnapfinder.com/",
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
    
    // Generate occasion labels in Korean
    const occasionLabels: Record<string, string> = {
      'couple': '커플스냅',
      'family': '가족스냅',
      'solo': '개인스냅',
      'friends': '우정스냅',
      'maternity': '만삭스냅',
      'wedding': '웨딩스냅',
      'engagement': '약혼스냅',
      'anniversary': '기념일스냅',
      'graduation': '졸업스냅',
      'birthday': '생일스냅',
      'proposal': '프러포즈스냅',
      'honeymoon': '신혼여행스냅',
      'business': '비즈니스스냅',
      'pet': '반려동물스냅',
      'kids': '아이스냅'
    };
    
    // Get occasions as Korean labels
    const occasions = (pkg.occasions || [])
      .map((o: string) => occasionLabels[o] || o)
      .slice(0, 3)
      .join(', ');
    
    // Get mood hashtags
    const moods = (pkg.mood || [])
      .slice(0, 3)
      .map((m: string) => `#${m}`)
      .join(' ');
    
    // Format price
    const priceFormatted = (pkg.price_krw || pkg.price || 0).toLocaleString();
    
    // Build SEO-optimized title (max 60 chars)
    const occasionPrefix = occasions ? `${occasions.split(',')[0].trim()} ` : '';
    title = `${pkg.title} - ${occasionPrefix}${priceFormatted}원 | 제주스냅파인더`;
    if (title.length > 60) {
      title = `${pkg.title} | 제주스냅파인더`;
    }
    
    // Build SEO-optimized description (max 160 chars)
    const descParts: string[] = [];
    
    // Add occasions
    if (occasions) {
      descParts.push(occasions);
    }
    
    // Add price
    descParts.push(`${priceFormatted}원`);
    
    // Add duration if available
    if (pkg.duration_minutes) {
      const hours = Math.floor(pkg.duration_minutes / 60);
      const mins = pkg.duration_minutes % 60;
      const durationStr = hours > 0 
        ? (mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`)
        : `${mins}분`;
      descParts.push(durationStr);
    }
    
    // Start building description
    let descBase = `제주도 ${descParts.join(' · ')}`;
    
    // Add mood if available
    if (moods) {
      descBase += ` ${moods}`;
    }
    
    // Add tips excerpt if available and space permits
    if (pkg.Tips && descBase.length < 120) {
      const tipsExcerpt = pkg.Tips.substring(0, 160 - descBase.length - 5).trim();
      if (tipsExcerpt.length > 10) {
        descBase += ` | ${tipsExcerpt}`;
      }
    } else if (pkg.details && descBase.length < 120) {
      // Fallback to details
      const detailsExcerpt = pkg.details.substring(0, 160 - descBase.length - 5).trim();
      if (detailsExcerpt.length > 10) {
        descBase += ` | ${detailsExcerpt}`;
      }
    }
    
    description = descBase.substring(0, 160);
    
    // Use package thumbnail
    ogImage = pkg.thumbnail_url || ogImage;

    // Enhanced package structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": pkg.title,
      "description": pkg.details || pkg.description || "제주도 사진촬영 서비스",
      "image": pkg.thumbnail_url,
      "category": occasions || "사진촬영",
      "offers": {
        "@type": "Offer",
        "price": pkg.price_krw || pkg.price,
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock"
      },
      "provider": {
        "@type": "Organization",
        "name": "제주스냅파인더",
        "url": "https://jejusnapfinder.com"
      },
      ...(pkg.duration_minutes && {
        "duration": `PT${pkg.duration_minutes}M`
      }),
      ...(moods && {
        "keywords": (pkg.mood || []).join(', ')
      })
    };
  }

  return { title, description, ogImage, structuredData };
}
