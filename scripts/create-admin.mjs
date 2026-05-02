/**
 * Create the first admin user for the panel.
 *
 *   node scripts/create-admin.mjs <email> <password> [display_name]
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 *
 * Steps:
 *   1. Creates (or finds) the auth user with the given email + password.
 *   2. Inserts a row in public.admin_profiles so middleware's is_admin() returns true.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Load .env.local manually (no extra dependency)
function loadEnv() {
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m || line.trim().startsWith('#')) continue;
      const [, k, v] = m;
      if (!process.env[k]) process.env[k] = v.replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore — vars may already be in env */ }
}
loadEnv();

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const [, , email, password, displayName = 'أحمد المدير'] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> [display_name]');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// 1. Create or fetch auth user
let userId = null;
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email, password, email_confirm: true, user_metadata: { display_name: displayName },
});
if (created?.user) {
  userId = created.user.id;
  console.log(`✓ Created auth user ${email} (${userId})`);
} else if (createErr?.message?.toLowerCase().includes('already')) {
  // User exists; look them up.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) { console.error(listErr); process.exit(1); }
  const found = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) { console.error('User exists but cannot be found via listUsers'); process.exit(1); }
  userId = found.id;
  console.log(`✓ Found existing auth user ${email} (${userId})`);
} else {
  console.error('Auth createUser failed:', createErr);
  process.exit(1);
}

// 2. Mark them admin
const { error: insErr } = await supabase
  .from('admin_profiles')
  .upsert({ id: userId, display_name: displayName }, { onConflict: 'id' });

if (insErr) { console.error('admin_profiles upsert failed:', insErr); process.exit(1); }
console.log(`✓ Granted admin role to ${email}`);
console.log('\nLog in at /admin/login with:');
console.log(`  email:    ${email}`);
console.log(`  password: ${password}`);
