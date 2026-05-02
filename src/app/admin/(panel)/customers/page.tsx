import { createAdminClient } from '@/lib/supabase/admin';
import CustomersTable from './CustomersTable';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const supabase = createAdminClient();

  const [{ data: customers, error: customersError }, { data: bookingsAgg, error: bookingsError }] =
    await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('customer_id, total_kwd, status'),
    ]);

  if (customersError) {
    console.error('admin customers query error', customersError);
  }
  if (bookingsError) {
    console.error('admin customers bookings aggregate error', bookingsError);
  }

  const stats = new Map<string, { bookings: number; spent: number }>();
  for (const b of bookingsAgg ?? []) {
    if (!b.customer_id) continue;
    const cur = stats.get(b.customer_id) ?? { bookings: 0, spent: 0 };
    cur.bookings++;
    if (b.status === 'confirmed' || b.status === 'completed') cur.spent += Number(b.total_kwd);
    stats.set(b.customer_id, cur);
  }

  const enriched = (customers ?? []).map(c => ({
    ...c,
    bookings: stats.get(c.id)?.bookings ?? 0,
    spent: stats.get(c.id)?.spent ?? 0,
  }));

  return <CustomersTable customers={enriched} />;
}
