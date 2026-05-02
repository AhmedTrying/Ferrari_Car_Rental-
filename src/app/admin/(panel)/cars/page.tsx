import { createAdminClient } from '@/lib/supabase/admin';
import CarsManager from './CarsManager';

export const dynamic = 'force-dynamic';

export default async function AdminCarsPage() {
  const supabase = createAdminClient();
  const { data: cars } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
  return <CarsManager cars={cars ?? []} />;
}
