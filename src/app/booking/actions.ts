'use server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const Schema = z.object({
  car_id: z.string().uuid().optional().nullable(),
  car_label: z.string().min(1),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.coerce.number().int().min(1).max(60),
  destination: z.string().max(120).optional().nullable(),
  passengers: z.coerce.number().int().min(1).max(9).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  customer_name: z.string().min(2).max(80),
  customer_phone: z.string().min(6).max(20),
  customer_email: z.string().email().max(120).optional().nullable().or(z.literal('')),
  total_kwd: z.coerce.number().min(0),
});

export type BookingInput = z.infer<typeof Schema>;
export type BookingResult =
  | { ok: true; ref: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { ok: false, error: 'يرجى مراجعة الحقول', fieldErrors };
  }
  const data = parsed.data;

  // All writes go through the service-role client. The Server Action is the only
  // entry point — zod validation is the security gate, not RLS, since this runs
  // on the server. The public anon key cannot INSERT into bookings directly.
  const admin = createAdminClient();

  // Upsert customer (by phone)
  const { data: customer } = await admin
    .from('customers')
    .upsert(
      {
        name: data.customer_name,
        phone: data.customer_phone,
        email: data.customer_email || null,
      },
      { onConflict: 'phone' }
    )
    .select('id')
    .single();

  const { data: row, error } = await admin
    .from('bookings')
    .insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email || null,
      customer_id: customer?.id ?? null,
      car_id: data.car_id || null,
      car_label: data.car_label,
      pickup_date: data.pickup_date,
      days: data.days,
      destination: data.destination || null,
      passengers: data.passengers ?? 2,
      notes: data.notes || null,
      total_kwd: data.total_kwd,
      status: 'pending',
      source: 'web',
    })
    .select('ref')
    .single();

  if (error || !row) {
    console.error('booking insert error', error);
    return { ok: false, error: 'تعذر استلام الطلب. حاول مرة أخرى.' };
  }

  return { ok: true, ref: row.ref };
}
