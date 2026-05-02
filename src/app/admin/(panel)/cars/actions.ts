'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const CarSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2, 'المعرّف (slug) قصير جداً.')
    .max(80, 'المعرّف (slug) طويل جداً.')
    .regex(slugRegex, 'المعرّف (slug) يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطة - فقط.'),
  name_ar: z.string().min(1, 'الاسم بالعربي مطلوب.').max(80, 'الاسم بالعربي طويل جداً.'),
  model: z.string().min(1, 'الموديل مطلوب.').max(40, 'الموديل طويل جداً.'),
  name_en: z.string().min(1, 'الاسم بالإنجليزي مطلوب.').max(120, 'الاسم بالإنجليزي طويل جداً.'),
  type: z.enum(['luxury', 'suv', 'sports']),
  year: z.coerce.number().int().min(1990, 'السنة يجب أن تكون 1990 أو أحدث.').max(2100, 'السنة غير صالحة.'),
  seats: z.coerce.number().int().min(1, 'عدد الركاب غير صالح.').max(12, 'عدد الركاب غير صالح.'),
  transmission: z.string().min(1, 'ناقل الحركة مطلوب.').max(40, 'ناقل الحركة طويل جداً.'),
  engine: z.string().min(1, 'المحرّك مطلوب.').max(60, 'المحرّك طويل جداً.'),
  price_per_day: z.coerce.number().min(0, 'السعر اليومي غير صالح.'),
  image_url: z.string().min(1, 'يرجى رفع صورة للسيارة.'),
  features: z.array(z.string()).default(['driver', 'insurance', 'mileage', 'no-deposit']),
  available: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
});

export type CarInput = z.infer<typeof CarSchema>;

export async function upsertCar(input: CarInput) {
  const normalizedInput = { ...input, slug: normalizeSlug(input.slug ?? '') };
  const parsed = CarSchema.safeParse(normalizedInput);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues.map(i => i.message).join(', ') };
  }
  const supabase = createAdminClient();
  const { error } = parsed.data.id
    ? await supabase.from('cars').update(parsed.data).eq('id', parsed.data.id)
    : await supabase.from('cars').insert(parsed.data);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/cars');
  revalidatePath('/cars');
  revalidatePath('/');
  return { ok: true as const };
}

export async function deleteCar(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('cars').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/cars');
  revalidatePath('/cars');
  revalidatePath('/');
  return { ok: true as const };
}

export async function toggleCarAvailability(id: string, available: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('cars').update({ available }).eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/cars');
  revalidatePath('/cars');
  revalidatePath('/');
  return { ok: true as const };
}

export async function uploadCarImage(formData: FormData) {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false as const, error: 'لم يتم اختيار ملف صالح.' };
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false as const, error: 'الملف يجب أن يكون صورة.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false as const, error: 'حجم الصورة كبير جداً (الحد الأقصى 10MB).' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `cars/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from('car-images')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return { ok: false as const, error: `فشل رفع الصورة: ${error.message}` };

  const { data } = supabase.storage.from('car-images').getPublicUrl(path);
  return { ok: true as const, url: data.publicUrl };
}
