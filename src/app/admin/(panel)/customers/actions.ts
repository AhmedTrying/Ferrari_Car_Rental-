'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const Schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(20),
  email: z.string().email().max(120).optional().or(z.literal('')).nullable(),
  tier: z.enum(['bronze', 'silver', 'gold']).default('bronze'),
  notes: z.string().max(1000).optional().nullable(),
});

export async function upsertCustomer(input: z.infer<typeof Schema>) {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const supabase = createAdminClient();
  const { error } = parsed.data.id
    ? await supabase.from('customers').update(parsed.data).eq('id', parsed.data.id)
    : await supabase.from('customers').insert(parsed.data);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/customers');
  revalidatePath('/admin');
  return { ok: true as const };
}

export async function deleteCustomer(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath('/admin/customers');
  revalidatePath('/admin');
  return { ok: true as const };
}
