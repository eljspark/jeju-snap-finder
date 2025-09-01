export { onBeforeRender }

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cvuirhzznizztbtclieu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function onBeforeRender() {
  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching packages for jeju page:', error)
      return {
        pageContext: {
          pageProps: {
            title: "제주 스냅 사진 패키지 전체 목록 - JejuSnapFinder",
            description: "제주도 여행 스냅 사진 촬영 패키지 전체 목록을 확인하세요. 커플, 가족, 우정, 만삭, 아기 촬영까지 다양한 패키지 제공.",
            packages: []
          }
        }
      }
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "제주 스냅 사진 패키지 전체 목록",
      "description": "제주도 여행 스냅 사진 촬영 패키지 전체 목록",
      "numberOfItems": packages?.length || 0,
      "itemListElement": packages?.map((pkg, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Service",
          "@id": `https://jejusnapfinder.com/packages/${pkg.id}`,
          "name": pkg.title,
          "description": pkg.details,
          "offers": {
            "@type": "Offer",
            "price": pkg.price_krw,
            "priceCurrency": "KRW"
          }
        }
      })) || []
    }

    return {
      pageContext: {
        pageProps: {
          title: "제주 스냅 사진 패키지 전체 목록 - JejuSnapFinder",
          description: "제주도 여행 스냅 사진 촬영 패키지 전체 목록을 확인하세요. 커플, 가족, 우정, 만삭, 아기 촬영까지 다양한 패키지 제공.",
          packages: packages || [],
          structuredData
        }
      }
    }

  } catch (error) {
    console.warn('Error in onBeforeRender for jeju page:', error)
    return {
      pageContext: {
        pageProps: {
          packages: [],
          title: "제주 스냅 사진 패키지 전체 목록 - JejuSnapFinder",
          description: "제주도 여행 스냅 사진 촬영 패키지 전체 목록을 확인하세요."
        }
      }
    }
  }
}