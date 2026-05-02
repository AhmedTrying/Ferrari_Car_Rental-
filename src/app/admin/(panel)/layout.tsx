import AdminShell from '@/components/admin/AdminShell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // middleware already redirects, but we also fetch the display name here.
  const displayName = (user?.user_metadata?.display_name as string) || (user?.email?.split('@')[0]) || 'Admin';

  return <AdminShell userInitial={displayName[0]?.toUpperCase() ?? 'A'} userName={displayName}>{children}</AdminShell>;
}
