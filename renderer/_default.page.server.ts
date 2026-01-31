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
  
  // Load meta overrides from file
  let metaOverrides: Record<string, any> = {};
  try {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const overridesPath = join(process.cwd(), 'public', 'data', 'package-meta-overrides.json');
    const overridesData = readFileSync(overridesPath, 'utf-8');
    metaOverrides = JSON.parse(overridesData);
  } catch {
    // No overrides file, use defaults
  }

  // Get package data from pageProps (set by onBeforeRender in package pages)
  const packageData = pageProps?.packageData || null;
  const packageId = packageData?.id || null;
  const packageMetaOverride = packageId ? metaOverrides[packageId] : null;

  // Generate meta tags based on page and data
  const { title, description, ogImage, ogTitle, ogDescription, twitterDescription, canonicalUrl, ogType, structuredData } = generateMetaTags(
    pageContext.urlPathname, 
    { 
      packageData, 
      packages: pageProps?.packages || [],
      packageMetaOverride 
    }
  );
  
  const pageHtml = ReactDOMServer.renderToString(
    React.createElement(Page, { pageProps })
  );

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        ${canonicalUrl ? dangerouslySkipEscape(`<link rel="canonical" href="${canonicalUrl}" />`) : ''}

        <!-- Google Analytics -->
        ${dangerouslySkipEscape(`
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-KF157LNGL5"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KF157LNGL5');
          </script>
        `)}
        
        <!-- Google AdSense (global) -->
        ${dangerouslySkipEscape(
          import.meta.env.PROD
            ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3433360229161618" crossorigin="anonymous"></script>`
            : ''
        )}
        
        <!-- Open Graph -->
        <meta property="og:title" content="${ogTitle || title}" />
        <meta property="og:description" content="${ogDescription || description}" />
        <meta property="og:image" content="${ogImage}" />
        ${canonicalUrl ? dangerouslySkipEscape(`<meta property="og:url" content="${canonicalUrl}" />`) : ''}
        <meta property="og:type" content="${ogType || 'website'}" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${ogTitle || title}" />
        <meta name="twitter:description" content="${twitterDescription || ogDescription || description}" />
        <meta name="twitter:image" content="${ogImage}" />
        
        <!-- Naver Site Verification -->
        <meta name="naver-site-verification" content="e6c43980d7aadfed027fc5e211b84ec7bb5749bd" />
        
        <!-- Structured Data -->
        ${structuredData ? dangerouslySkipEscape(`<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`) : ''}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
        <script>
          window.__STATIC_DATA__ = ${dangerouslySkipEscape(JSON.stringify({ packageData, packages: pageProps?.packages || [] }))};
        </script>
      </body>
    </html>`;

  return {
    documentHtml
  };
}

function generateMetaTags(urlPathname: string, staticData: any) {
  const BASE_URL = "https://jejusnapfinder.com";
  
  // Default meta
  let title = "제주 스냅 촬영 비교 - 커플, 가족, 만삭 스냅 패키지 총정리 | 제주스냅파인더";
  let description = "제주도 커플스냅, 가족스냅, 만삭스냅 작가님들을 가격별, 유형별로 쉽게 비교하고 찾을 수 있어요.";
  let ogImage = "https://cvuirhzznizztbtclieu.supabase.co/storage/v1/object/public/packages/hero-jeju.jpg";
  let ogTitle = "";
  let ogDescription = "";
  let twitterDescription = "";
  let canonicalUrl = "";
  let ogType = "website";
  let structuredData: any = null;

  if (urlPathname === '/') {
    canonicalUrl = BASE_URL + "/";
  }

  if (urlPathname === '/' && staticData.packages) {
    // Homepage structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": description,
      "url": BASE_URL + "/",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": staticData.packages.slice(0, 10).map((pkg: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": pkg.title,
            "description": pkg.details || "제주도 사진촬영 서비스",
            "offers": {
              "@type": "Offer",
              "price": pkg.price_krw || pkg.price,
              "priceCurrency": "KRW"
            }
          }
        }))
      }
    };
  }

  if (staticData.packageData) {
    const pkg = staticData.packageData;
    const override = staticData.packageMetaOverride;
    
    // If we have custom overrides for this package, use them
    if (override) {
      title = override.title || title;
      description = override.description || description;
      ogTitle = override.ogTitle || '';
      ogDescription = override.ogDescription || '';
      twitterDescription = override.twitterDescription || '';
      ogImage = override.ogImage || pkg.thumbnail_url || ogImage;
      canonicalUrl = `${BASE_URL}/packages/${pkg.id}`;
      ogType = "product";
      structuredData = override.structuredData || null;
      
      return { title, description, ogImage, ogTitle, ogDescription, twitterDescription, canonicalUrl, ogType, structuredData };
    }
    
    // Default auto-generated meta tags for packages without overrides
    
    // Korean occasion labels mapping
    const occasionLabels: Record<string, string> = {
      '커플': '커플',
      '가족': '가족',
      '우정': '우정',
      '프로필': '프로필',
      '웨딩': '웨딩',
      '만삭': '만삭',
      '개인': '개인',
      '아기': '아기'
    };
    
    // Get occasions as display labels
    const occasionsList = (pkg.occasions || []).map((o: string) => occasionLabels[o] || o);
    const occasionsDisplay = occasionsList.join('·');
    const occasionsCategory = occasionsList.join(', ');
    
    // Format duration
    let durationDisplay = '';
    if (pkg.duration_minutes) {
      durationDisplay = `${pkg.duration_minutes}분`;
    } else if (pkg.duration) {
      durationDisplay = pkg.duration;
    }
    
    // Format price
    const price = pkg.price_krw || pkg.price || 0;
    const priceInMan = price >= 10000 ? `${Math.floor(price / 10000)}만원` : `${price.toLocaleString()}원`;
    
    // Canonical URL
    canonicalUrl = `${BASE_URL}/packages/${pkg.id}`;
    ogType = "product";
    
    // Build title: "{title} - 제주 {occasions} 스냅 {duration} {price} | 제주스냅파인더"
    title = `${pkg.title} - 제주 ${occasionsDisplay} 스냅 ${durationDisplay} ${priceInMan} | 제주스냅파인더`;
    
    // Build OG title (shorter): "{title} - 제주 {occasions} 스냅 {duration} {price}"
    ogTitle = `${pkg.title} - 제주 ${occasionsDisplay} 스냅 ${durationDisplay} ${priceInMan}`;
    
    // Extract details from package
    const details = pkg.details || '';
    
    // Parse details for key info (원본, 보정, etc.)
    const extractDetailsInfo = (detailsText: string) => {
      const lines = detailsText.split('\n').filter((l: string) => l.trim());
      const keyInfo: string[] = [];
      
      for (const line of lines) {
        // Look for patterns like "원본 600장", "보정 15장", etc.
        if (line.includes('원본') || line.includes('보정') || line.includes('제공')) {
          keyInfo.push(line.replace(/^\d+\.\s*/, '').trim());
        }
      }
      
      return keyInfo.slice(0, 2).join(', ');
    };
    
    const detailsInfo = extractDetailsInfo(details);
    
    // Build description: "{title} 제주 {occasions} 스냅 촬영. {duration} 촬영, {details excerpt}. 예약 및 포트폴리오 확인."
    const descriptionParts = [
      `${pkg.title} 제주 ${occasionsCategory} 스냅 촬영.`
    ];
    
    if (durationDisplay) {
      descriptionParts.push(`${durationDisplay} 촬영`);
    }
    
    if (detailsInfo) {
      descriptionParts.push(detailsInfo);
    }
    
    // Add location info from Tips if available
    if (pkg.Tips) {
      const locationMatch = pkg.Tips.match(/([가-힣]+해수욕장|[가-힣]+해변|[가-힣]+오름|[가-힣]+숲|[가-힣]+공원)/);
      if (locationMatch) {
        descriptionParts.push(`${locationMatch[1]} 등 제주 자연 배경`);
      }
    }
    
    descriptionParts.push('예약 및 포트폴리오 확인.');
    
    description = descriptionParts.join(' ').substring(0, 160);
    
    // Build OG description (shorter, with mood)
    const moods = (pkg.mood || []).slice(0, 2);
    const moodText = moods.length > 0 ? `${moods.join(' ')} 감성 스냅.` : '';
    ogDescription = `${durationDisplay} 촬영${detailsInfo ? ', ' + detailsInfo : ''}. ${moodText}`.trim();
    if (ogDescription.length > 100) {
      ogDescription = ogDescription.substring(0, 97) + '...';
    }
    
    // Twitter description (even shorter)
    twitterDescription = `${durationDisplay} 촬영${detailsInfo ? ', ' + detailsInfo : ''}`;
    
    // Use package thumbnail
    ogImage = pkg.thumbnail_url || ogImage;

    // Product structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${pkg.title} 제주 스냅 촬영`,
      "description": `제주 ${occasionsCategory} 스냅 촬영 전문. ${durationDisplay} 촬영${detailsInfo ? ', ' + detailsInfo : ''}`,
      "image": ogImage,
      "offers": {
        "@type": "Offer",
        "price": String(price),
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock"
      },
      "brand": {
        "@type": "Brand",
        "name": pkg.title
      },
      "category": occasionsCategory || "스냅촬영"
    };
  }

  return { title, description, ogImage, ogTitle, ogDescription, twitterDescription, canonicalUrl, ogType, structuredData };
}
