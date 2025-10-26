import AdminImages from '../src/pages/AdminImages';

export { Page };

// Disable SSR for admin page - it needs client-side Supabase access
export const ssr = false;

function Page() {
  return <AdminImages />;
}
