// Skip prerendering for admin - it's a client-only page
export async function prerender() {
  return false;
}
