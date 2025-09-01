export { onBeforeRender }

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cvuirhzznizztbtclieu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function onBeforeRender(pageContext: any) {
  const { id } = pageContext.routeParams

  try {
    const { data: packageData, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()

    if (error || !packageData) {
      console.warn(`Package ${id} not found or error:`, error)
      return {
        pageContext: {
          pageProps: {
            packageNotFound: true,
            title: "패키지를 찾을 수 없습니다 - JejuSnapFinder",
            description: "요청하신 패키지를 찾을 수 없습니다."
          }
        }
      }
    }

    // Get thumbnail URL
    let thumbnailUrl = "/hero-jeju.jpg"
    if (packageData.thumbnail_url) {
      thumbnailUrl = packageData.thumbnail_url
    } else if (packageData.folder_path) {
      // Try to construct a URL from folder path - fallback to placeholder if not available
      try {
        const { data: files } = await supabase.storage
          .from('packages')
          .list(packageData.folder_path)
        
        if (files && files.length > 0) {
          const firstImage = files.find(file => 
            file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/i)
          )
          if (firstImage) {
            const { data: urlData } = supabase.storage
              .from('packages')
              .getPublicUrl(`${packageData.folder_path}/${firstImage.name}`)
            thumbnailUrl = urlData.publicUrl
          }
        }
      } catch (error) {
        console.warn('Error fetching folder images:', error)
      }
    }

    // Create structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `https://jejusnapfinder.com/packages/${packageData.id}`,
      "name": packageData.title,
      "description": packageData.details,
      "provider": {
        "@type": "Organization",
        "name": "JejuSnapFinder"
      },
      "offers": {
        "@type": "Offer",
        "price": packageData.price_krw,
        "priceCurrency": "KRW"
      },
      "image": thumbnailUrl,
      "category": packageData.occasions?.join(", ") || "스냅 사진"
    }

    const title = `${packageData.title} - 제주 스냅 사진 | JejuSnapFinder`
    const description = packageData.details || `${packageData.title} 스냅 촬영 패키지입니다. 가격: ${packageData.price_krw?.toLocaleString()}원`

    return {
      pageContext: {
        pageProps: {
          packageData,
          title,
          description,
          image: thumbnailUrl,
          structuredData
        }
      }
    }

  } catch (error) {
    console.warn(`Error fetching package ${id}:`, error)
    return {
      pageContext: {
        pageProps: {
          packageNotFound: true,
          title: "패키지를 찾을 수 없습니다 - JejuSnapFinder",
          description: "요청하신 패키지를 찾을 수 없습니다."
        }
      }
    }
  }
}