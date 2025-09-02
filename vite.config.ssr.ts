import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export const prerender = async () => {
  const routesPath = join(process.cwd(), 'public', 'data', 'routes.json');
  
  try {
    if (existsSync(routesPath)) {
      const routes = JSON.parse(readFileSync(routesPath, 'utf-8'));
      console.log(`📄 Pre-rendering ${routes.length} routes:`, routes);
      return routes;
    }
  } catch (error) {
    console.warn('Could not load routes for prerendering:', error);
  }
  
  // Fallback routes
  const fallbackRoutes = ['/'];
  console.log('📄 Using fallback routes:', fallbackRoutes);
  return fallbackRoutes;
};