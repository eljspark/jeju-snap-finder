export { onBeforePrerenderStart }

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cvuirhzznizztbtclieu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dWlyaHp6bml6enRidGNsaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI5NDksImV4cCI6MjA3MDkwODk0OX0.NjZ27UkIucha31KdnjeLMl1gxJsuDBouflxmrnRw-EM"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function onBeforePrerenderStart() {
  const routes = ['/']

  try {
    // Fetch all active packages
    const { data: packages, error } = await supabase
      .from('packages')
      .select('id, occasions')
      .eq('active', true)

    if (error) {
      console.warn('Error fetching packages for prerendering:', error)
      return routes
    }

    if (packages) {
      // Add package detail routes
      packages.forEach(pkg => {
        routes.push(`/packages/${pkg.id}`)
      })

      // Add jeju routes
      routes.push('/jeju')
      
      // Get unique occasions and add occasion-specific routes
      const allOccasions = new Set()
      packages.forEach(pkg => {
        if (pkg.occasions && Array.isArray(pkg.occasions)) {
          pkg.occasions.forEach(occasion => allOccasions.add(occasion))
        }
      })
      
      allOccasions.forEach(occasion => {
        routes.push(`/jeju/${encodeURIComponent(occasion as string)}`)
      })
    }

    console.log(`Prerendering ${routes.length} routes:`, routes)
    return routes

  } catch (error) {
    console.warn('Error during route generation:', error)
    return routes
  }
}