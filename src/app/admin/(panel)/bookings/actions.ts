'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingStatus } from '@/lib/supabase/database.types';

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteBooking(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  return { ok: true };
}

type UpdateBookingInput = {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  car_label: string;
  pickup_date: string;
  days: number;
  total_kwd: number;
  status: BookingStatus;
  destination?: string | null;
  passengers?: number | null;
  notes?: string | null;
};

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function updateBookingDetails(input: UpdateBookingInput) {
  const customerName = input.customer_name.trim();
  const customerPhone = input.customer_phone.trim();
  const carLabel = input.car_label.trim();
  const pickupDate = input.pickup_date.trim();
  const email = input.customer_email?.trim() || null;
  const destination = input.destination?.trim() || null;
  const notes = input.notes?.trim() || null;

  if (!customerName || customerName.length < 2) {
    return { ok: false, error: 'اسم العميل غير صالح.' };
  }
  if (!customerPhone || customerPhone.length < 6) {
    return { ok: false, error: 'رقم الهاتف غير صالح.' };
  }
  if (!carLabel) {
    return { ok: false, error: 'اسم السيارة مطلوب.' };
  }
  if (!isIsoDate(pickupDate)) {
    return { ok: false, error: 'تاريخ الاستلام غير صالح.' };
  }
  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 60) {
    return { ok: false, error: 'عدد الأيام يجب أن يكون بين 1 و 60.' };
  }
  if (!Number.isFinite(input.total_kwd) || input.total_kwd < 0) {
    return { ok: false, error: 'الإجمالي غير صالح.' };
  }
  if (input.passengers != null && (!Number.isInteger(input.passengers) || input.passengers < 1 || input.passengers > 9)) {
    return { ok: false, error: 'عدد الركاب يجب أن يكون بين 1 و 9.' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'البريد الإلكتروني غير صالح.' };
  }

  const supabase = createAdminClient();

  if (input.customer_id) {
    const { error: customerError } = await supabase
      .from('customers')
      .update({
        name: customerName,
        phone: customerPhone,
        email,
      })
      .eq('id', input.customer_id);

    if (customerError) {
      return { ok: false, error: customerError.message };
    }
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: email,
      car_label: carLabel,
      pickup_date: pickupDate,
      days: input.days,
      total_kwd: input.total_kwd,
      status: input.status,
      destination,
      passengers: input.passengers ?? null,
      notes,
    })
    .eq('id', input.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
  return { ok: true };
}
