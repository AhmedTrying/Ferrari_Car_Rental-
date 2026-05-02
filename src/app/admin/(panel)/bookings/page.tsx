import { createAdminClient } from '@/lib/supabase/admin';
import BookingsTable from './BookingsTable';
import type { BookingStatus } from '@/lib/supabase/database.types';
import { fetchAdminBookings } from '@/lib/admin/bookings';

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

export const dynamic = 'force-dynamic';

export default async function BookingsAdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createAdminClient();
  const status = searchParams.status as BookingStatus | undefined;
  const activeStatus = status && VALID_STATUSES.includes(status) ? status : undefined;

  const [{ data: bookings, error: bookingsError }, { count: total, error: countError }] = await Promise.all([
    fetchAdminBookings(supabase, { status: activeStatus }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
  ]);

  if (bookingsError) {
    console.error('admin bookings query error', bookingsError);
  }
  if (countError) {
    console.error('admin bookings count error', countError);
  }

  return <BookingsTable bookings={bookings} totalCount={total ?? 0} activeStatus={activeStatus ?? 'all'} />;
}
