# Applying the migration — the reliable path

The Supabase Dashboard SQL Editor has been mangling your script (injecting metadata comments inside dollar-quoted strings, emitting empty trailing statements). Skip it. Use the CLI — it sends SQL to Postgres byte-for-byte.

## One-time setup

```bash
cd web

# 1. Log in to Supabase (opens browser)
npx supabase login

# 2. Link this folder to your project
npx supabase link --project-ref ajsgyfbebujoqlyoqonb
```

## Apply schema + seed

```bash
# Apply the migration (idempotent IF you start from a clean DB)
npx supabase db push

# Load the seed data
npx supabase db execute -f supabase/seed.sql
# Or via psql, see below
```

## If `db push` complains "schema drift" or "tables already exist"

Reset the public schema first. Get your direct-connection string from
**Supabase Dashboard → Project Settings → Database → Connection string → URI**.
It looks like `postgresql://postgres:[YOUR-PASSWORD]@db.ajsgyfbebujoqlyoqonb.supabase.co:5432/postgres`.

```bash
# Reset (destroys public.* — safe on a fresh project)
psql "postgresql://postgres:PASS@db.ajsgyfbebujoqlyoqonb.supabase.co:5432/postgres" \
  -c "drop schema public cascade; create schema public; grant usage on schema public to anon, authenticated, service_role;"

# Apply schema + seed in one go
psql "postgresql://postgres:PASS@db.ajsgyfbebujoqlyoqonb.supabase.co:5432/postgres" \
  -f supabase/migrations/0001_initial_schema.sql

psql "postgresql://postgres:PASS@db.ajsgyfbebujoqlyoqonb.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

## Create the first admin user

```sql
-- 1. Dashboard → Authentication → Users → "Add user" → email/password
--    e.g. admin@ferrari-rentcar.kw / a-strong-password

-- 2. Then mark them admin:
insert into public.admin_profiles (id, display_name)
values ((select id from auth.users where email = 'admin@ferrari-rentcar.kw'), 'أحمد المدير');
```

## Why not the Dashboard SQL Editor?

It silently injects comments like `-- source: dashboard / -- user: ... / -- date: ...` into your script and its statement splitter doesn't always respect dollar quotes or single-quoted bodies. For multi-statement migrations, always use `supabase db push` or `psql -f`.
