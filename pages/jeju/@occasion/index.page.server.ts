export { onBeforeRender }

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cvuirhzznizztbtclieu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function onBeforeRender(pageContext: any) {
  const { occasion } = pageContext.routeParams
  const decodedOccasion = decodeURIComponent(occasion)

  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .eq('active', true)
      .contains('occasions', [decodedOccasion])
      .order('created_at', { ascending: false })

    if (error) {
      console.warn(`Error fetching packages for occasion ${decodedOccasion}:`, error)
      return {
        pageContext: {
          pageProps: {
            title: `제주 ${decodedOccasion} 스냅 사진 - JejuSnapFinder`,
            description: `제주도 ${decodedOccasion} 스냅 사진 촬영 패키지를 확인하세요.`,
            packages: [],
            selectedOccasion: decodedOccasion
          }
        }
      }
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `제주 ${decodedOccasion} 스냅 사진 패키지`,
      "description": `제주도 ${decodedOccasion} 스냅 사진 촬영 패키지 목록`,
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
          title: `제주 ${decodedOccasion} 스냅 사진 - JejuSnapFinder`,
          description: `제주도 ${decodedOccasion} 스냅 사진 촬영 패키지를 확인하세요. 전문 사진작가와 함께하는 특별한 순간을 남겨보세요.`,
          packages: packages || [],
          selectedOccasion: decodedOccasion,
          structuredData
        }
      }
    }

  } catch (error) {
    console.warn(`Error in onBeforeRender for occasion ${decodedOccasion}:`, error)
    return {
      pageContext: {
        pageProps: {
          packages: [],
          title: `제주 ${decodedOccasion} 스냅 사진 - JejuSnapFinder`,
          description: `제주도 ${decodedOccasion} 스냅 사진 촬영 패키지를 확인하세요.`,
          selectedOccasion: decodedOccasion
        }
      }
    }
  }
}