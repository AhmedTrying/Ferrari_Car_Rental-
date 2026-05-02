import { SITE } from './constants';

export function waLink(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function buildBookingWaText(b: {
  customer_name: string; customer_phone: string;
  car_label: string; pickup_date: string; days: number;
  destination?: string | null; passengers?: number | null; notes?: string | null;
}) {
  return [
    'طلب حجز سيارة جديد:',
    '',
    `الاسم: ${b.customer_name || '—'}`,
    `الهاتف: ${b.customer_phone || '—'}`,
    `السيارة: ${b.car_label || '—'}`,
    `التاريخ: ${b.pickup_date}`,
    `الأيام: ${b.days}`,
    `الوجهة: ${b.destination || '—'}`,
    `الركاب: ${b.passengers ?? '—'}`,
    `ملاحظات: ${b.notes || '—'}`,
  ].join('\n');
}

export function fmtKwd(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function fmtDate(s: string) {
  // ISO -> YYYY-MM-DD (already)
  return s.slice(0, 10);
}

export function tomorrowIso() {
  return new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
}
