import AdminPage from '../src/pages/AdminPage';

export { Page };

// Disable SSR for admin page - it needs client-side Supabase access
export const ssr = false;

function Page() {
  return <AdminPage />;
}
