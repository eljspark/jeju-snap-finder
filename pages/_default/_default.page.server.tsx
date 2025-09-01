export { render }
export { onBeforeRender }
export { passToClient }

import ReactDOMServer from 'react-dom/server'
import React from 'react'
import { PageShell } from './PageShell'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import type { PageContextServer } from './types'

const passToClient = ['pageProps', 'urlPathname']

async function onBeforeRender(pageContext: PageContextServer) {
  return {
    pageContext: {
      // Pass any common data
    }
  }
}

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext
  
  // Render the page to HTML
  const pageHtml = ReactDOMServer.renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )

  // Extract SEO data from pageProps
  const { 
    title = "제주 스냅 사진 전문 업체 찾기 - JejuSnapFinder",
    description = "제주도 여행 스냅 사진 전문 업체를 쉽게 찾아보세요. 커플, 가족, 우정, 만삭, 아기 촬영 전문 스튜디오 정보와 예약까지 한번에!",
    image = "/hero-jeju.jpg",
    structuredData
  } = pageProps || {}

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <meta name="description" content="${description}" />
        <meta name="keywords" content="제주도 스냅사진, 제주 여행사진, 커플스냅, 가족사진, 제주 사진작가, 제주 포토스튜디오" />
        
        <!-- Open Graph -->
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="${image}" />
        <meta property="og:image:alt" content="제주도 스냅 사진" />
        <meta property="og:site_name" content="JejuSnapFinder" />
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
        
        ${structuredData ? dangerouslySkipEscape(`<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`) : ''}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // Additional context if needed
    }
  }
}