import { NextResponse } from 'next/server';
import { submitBooking, type BookingInput } from '@/app/booking/actions';

// POST /api/bookings — JSON: BookingInput. Public endpoint (RLS-gated).
export async function POST(req: Request) {
  let body: BookingInput;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 }); }

  const result = await submitBooking(body);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
