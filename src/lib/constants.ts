import type { CarType } from './supabase/database.types';

export const SITE = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '96550351550',
  phones: [
    process.env.NEXT_PUBLIC_PHONE_PRIMARY ?? '98822120',
    process.env.NEXT_PUBLIC_PHONE_SECONDARY ?? '90087236',
    process.env.NEXT_PUBLIC_PHONE_TERTIARY ?? '50351550',
  ],
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? 'ferrari_rentcar',
  email: process.env.NEXT_PUBLIC_EMAIL ?? 'info@ferrari-rentcar.kw',
};

export const CAR_TYPES: { id: CarType | 'all'; label: string }[] = [
  { id: 'all',    label: 'الكل' },
  { id: 'luxury', label: 'فاخرة' },
  { id: 'suv',    label: 'دفع رباعي' },
  { id: 'sports', label: 'رياضية' },
];

export const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

export const TIER_LABELS: Record<string, string> = {
  bronze: 'برونزي',
  silver: 'فضي',
  gold: 'ذهبي',
};

export const FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  driver:     { label: 'مع سائق',    icon: 'driver' },
  insurance:  { label: 'تأمين شامل', icon: 'shield' },
  mileage:    { label: 'عداد مفتوح', icon: 'gauge' },
  'no-deposit': { label: 'بدون كمبيالة', icon: 'no-deposit' },
};

export const ACCENT_COLORS = ['#FFD400', '#E63946', '#3A86FF', '#06D6A0', '#9B5DE5'];
