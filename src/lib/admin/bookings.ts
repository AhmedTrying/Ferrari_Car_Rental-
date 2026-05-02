import type { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, BookingStatus, Database } from '@/lib/supabase/database.types';

type RelatedCustomer = { name: string | null; phone: string | null };
type RelatedCar = { name_ar: string | null; model: string | null };

type RawBookingRow = Pick<
  Booking,
  | 'id'
  | 'ref'
  | 'customer_id'
  | 'car_id'
  | 'pickup_date'
  | 'days'
  | 'total_kwd'
  | 'status'
  | 'created_at'
  | 'customer_name'
  | 'customer_phone'
  | 'customer_email'
  | 'car_label'
  | 'destination'
  | 'passengers'
  | 'notes'
> & {
  customers?: RelatedCustomer | RelatedCustomer[] | null;
  cars?: RelatedCar | RelatedCar[] | null;
};

export type AdminBookingRow = Pick<
  Booking,
  | 'id'
  | 'ref'
  | 'customer_id'
  | 'car_id'
  | 'pickup_date'
  | 'days'
  | 'total_kwd'
  | 'status'
  | 'created_at'
  | 'customer_email'
  | 'destination'
  | 'passengers'
  | 'notes'
> & {
  customer_name: string;
  customer_phone: string;
  car_label: string;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function composeCarLabel(car: RelatedCar | null, fallback: string): string {
  if (fallback?.trim()) return fallback.trim();
  const fromRelation = [car?.name_ar, car?.model].filter(Boolean).join(' ').trim();
  if (fromRelation) return fromRelation;
  return '—';
}

function composeCustomerName(customer: RelatedCustomer | null, fallback: string): string {
  if (fallback?.trim()) return fallback.trim();
  if (customer?.name?.trim()) return customer.name.trim();
  return '—';
}

function composeCustomerPhone(customer: RelatedCustomer | null, fallback: string): string {
  if (fallback?.trim()) return fallback.trim();
  if (customer?.phone?.trim()) return customer.phone.trim();
  return '—';
}

function normalize(row: RawBookingRow): AdminBookingRow {
  const customer = one(row.customers);
  const car = one(row.cars);

  return {
    id: row.id,
    ref: row.ref,
    customer_id: row.customer_id,
    car_id: row.car_id,
    pickup_date: row.pickup_date,
    days: row.days,
    total_kwd: row.total_kwd,
    status: row.status,
    created_at: row.created_at,
    customer_email: row.customer_email,
    destination: row.destination,
    passengers: row.passengers,
    notes: row.notes,
    customer_name: composeCustomerName(customer, row.customer_name),
    customer_phone: composeCustomerPhone(customer, row.customer_phone),
    car_label: composeCarLabel(car, row.car_label),
  };
}

export async function fetchAdminBookings(
  supabase: SupabaseClient<Database>,
  opts?: { status?: BookingStatus; limit?: number }
) {
  const limit = opts?.limit ?? null;
  const status = opts?.status;

  let query = supabase
    .from('bookings')
    .select(
      `
      id,
      ref,
      customer_id,
      car_id,
      pickup_date,
      days,
      total_kwd,
      status,
      created_at,
      customer_name,
      customer_phone,
      customer_email,
      car_label,
      destination,
      passengers,
      notes,
      customers(name, phone),
      cars(name_ar, model)
    `
    )
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  return {
    data: ((data ?? []) as unknown as RawBookingRow[]).map(normalize),
    error,
  };
}
