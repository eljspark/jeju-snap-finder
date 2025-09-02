export async function prerender() {
  console.log('🔍 Looking for routes to prerender...');
  
  try {
    const { readFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    
    const routesPath = join(process.cwd(), 'public', 'data', 'routes.json');
    
    if (existsSync(routesPath)) {
      const routes = JSON.parse(readFileSync(routesPath, 'utf-8'));
      console.log(`✅ Found ${routes.length} routes to prerender:`, routes.slice(0, 5));
      return routes;
    }
  } catch (error) {
    console.warn('⚠️ Could not load routes for prerendering:', error.message);
  }
  
  // Fallback to basic route
  const fallbackRoutes = ['/'];
  console.log('📄 Using fallback routes:', fallbackRoutes);
  return fallbackRoutes;
}