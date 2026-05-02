# Ferrari Cars Rental — Production Web App

Arabic-RTL car rental site for Kuwait, with a public storefront and an admin panel. Built on Next.js 14 (App Router) + Supabase (Postgres, Auth, Storage, RLS).

> The visuals come from a hand-tuned HTML/CSS prototype at the project root. This `web/` directory is the production rewrite — same layouts and tokens, real data, real auth.

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | **Next.js 14 (App Router) + TypeScript** | RTL-friendly, Server Components for fast initial paint, Server Actions for booking/admin mutations, ISR on cars list. |
| Styling | **Tailwind utilities + CSS variables** | Theme tokens identical to the prototype (`--y`, `--ink`, `--bg`…), painless light/dark + accent picker. |
| Validation | **zod** (server-side in Server Actions) | Same schema runs on `/api/bookings` JSON wrapper. |
| Charts | **Recharts** | Tiny, RTL-safe, themed via CSS variables. |
| Auth + DB + Storage | **Supabase** | Postgres + RLS + Auth (admin gate via `admin_profiles`) + a `car-images` bucket. |
| Hosting | **Vercel** + **Supabase Cloud** | Both have free tiers and zero-config deploys. |

---

## Project layout

```
web/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                  # RTL + fonts + theme provider
│  │  ├─ page.tsx                    # / — hero, features, car grid, contacts, testimonials
│  │  ├─ cars/page.tsx               # /cars — full fleet + filters
│  │  ├─ booking/
│  │  │   ├─ page.tsx                # /booking — multi-step booking form (RSC shell)
│  │  │   ├─ BookingForm.tsx         # Client component, 3 steps, live summary
│  │  │   └─ actions.ts              # Server action: zod-validated insert into bookings
│  │  ├─ about/page.tsx              # /about
│  │  ├─ api/bookings/route.ts       # POST /api/bookings — JSON wrapper around the action
│  │  └─ admin/
│  │      ├─ layout.tsx              # admin chrome (no WhatsApp FAB)
│  │      ├─ login/                  # /admin/login (Supabase password auth)
│  │      └─ (panel)/                # everything below this segment is protected
│  │          ├─ layout.tsx          # AdminShell + display name lookup
│  │          ├─ page.tsx            # /admin — KPIs + chart + top cars + recent bookings
│  │          ├─ bookings/           # /admin/bookings — table, filters, status cycle, delete
│  │          ├─ cars/               # /admin/cars — CRUD + image upload + availability toggle
│  │          └─ customers/          # /admin/customers — CRUD + tier + CSV export + search
│  ├─ components/
│  │  ├─ TopNav.tsx, Footer.tsx, ThemeChrome.tsx, ThemeProvider.tsx
│  │  ├─ CarCard.tsx, CarFilters.tsx
│  │  ├─ icons.tsx                   # SVG registry (Stars helper too)
│  │  └─ admin/
│  │      ├─ AdminShell.tsx          # sidebar + topbar, sign-out
│  │      └─ RevenueChart.tsx        # Recharts wrapper themed via CSS vars
│  ├─ lib/
│  │  ├─ supabase/{client,server,admin,database.types}.ts
│  │  ├─ constants.ts utils.ts
├─ middleware.ts                     # gates /admin/** via `is_admin()` RPC
├─ supabase/
│  ├─ migrations/0001_initial_schema.sql
│  ├─ seed.sql                       # 8 cars, 7 customers, 6 bookings, 3 testimonials
│  └─ config.toml
├─ scripts/create-admin.mjs          # bootstrap the first admin user
├─ public/assets/                    # car1.jpg … car8.jpg, logo.jpg, insta.png
├─ APPLY_MIGRATION.md                # CLI instructions for applying the schema
└─ README.md (this file)
```

---

## Getting started

### 1. Install
```bash
cd web
npm install
```

### 2. Configure environment
Copy `.env.example` → `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...           # (or the legacy JWT — both work)
```

### 3. Apply the schema + seed
**Don't use the Dashboard SQL Editor** — its preprocessor injects metadata comments that break dollar-quoted blocks. Use the CLI (full instructions in [APPLY_MIGRATION.md](./APPLY_MIGRATION.md)):
```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
npx supabase db execute -f supabase/seed.sql
```

### 4. Create the first admin user
```bash
npm run admin:create -- admin@ferrari-rentcar.kw 'A-strong-password' 'أحمد المدير'
```
The script uses your `SUPABASE_SERVICE_ROLE_KEY` to call `auth.admin.createUser`, then inserts into `public.admin_profiles` so the `is_admin()` RPC returns `true`.

### 5. Regenerate types after every schema change
```bash
npm run db:types
```

### 6. Run dev
```bash
npm run dev   # http://localhost:3000  (or whichever port the harness assigns)
```

---

## Database model

### Tables
- **cars** — `id slug name_ar model name_en type[luxury|suv|sports] year seats transmission engine price_per_day image_url features:jsonb available featured rentals_count timestamps`
- **customers** — `id name phone(unique) email tier[bronze|silver|gold] notes timestamps`
- **bookings** — `id ref(unique) customer_id? car_id? customer_name customer_phone customer_email? car_label pickup_date days destination passengers notes total_kwd status[pending|confirmed|completed|cancelled] source created_at updated_at`
  - Snapshot fields (`customer_name`, `car_label`, …) preserve historical bookings even if the source car or customer is deleted.
  - `ref` auto-generates as `B-####` if not provided.
- **testimonials** — `id customer_name text rating(1-5) published`
- **admin_profiles** — `id` references `auth.users(id)`. Acts as the admin role.

### Views (used by /admin)
- **v_kpis** — revenue this month, active bookings, cars available/total, new customers (30d)
- **v_revenue_monthly** — `ym, revenue, bookings` for the bar chart
- **v_top_cars** — leaderboard by booking count

### Functions
- **is_admin()** — `select exists(select 1 from admin_profiles where id = auth.uid())`. Stable, used by RLS and middleware.

### Row-Level Security
| Table | Public read | Public write | Admin |
| --- | --- | --- | --- |
| cars | ✓ all rows | — | full CRUD |
| testimonials | ✓ where `published = true` | — | full CRUD |
| bookings | — | ✓ INSERT only (booking form) | full CRUD |
| customers | — | — | full CRUD |
| admin_profiles | self-row only | — | full |
| storage.objects (`car-images`) | ✓ public read | — | upload/delete |

### Storage
Bucket `car-images` is public-read, admin-write. The car-edit modal at `/admin/cars` uploads via `supabase.storage.from('car-images').upload(...)` and stores the public URL in `cars.image_url`.

---

## Key flows

### Public booking
1. `/booking` (RSC) loads available cars from Supabase via the SSR client.
2. `BookingForm` (client) keeps state for 3 steps + a live summary aside.
3. Submit → calls Server Action `submitBooking` (zod-validated):
   - Service-role client **upserts** the customer (matched by phone).
   - SSR client **inserts** the booking (allowed by `bookings_public_insert` RLS).
   - Service-role client back-links `customer_id` on the new booking.
4. WhatsApp button at every step composes a pre-filled `wa.me` link.
5. `/api/bookings` is a JSON wrapper that calls the same action — useful for embeds or Zapier.

### Admin auth
- `middleware.ts` runs on `/admin/**`, verifies a Supabase session, then calls the `is_admin()` RPC. Non-admins are redirected to `/admin/login?error=forbidden`.
- Already-logged-in admins hitting `/admin/login` get bounced to `/admin`.
- `LoginForm` uses `signInWithPassword`, then re-checks `is_admin` client-side and signs out non-admins immediately.

### Admin CRUD
- **Cars**: filter chips, KPI strip, grid of editable cards. Modal supports image upload (Supabase Storage) and toggles `available`/`featured`. Server actions revalidate `/admin/cars`, `/cars`, `/`.
- **Bookings**: status filter as URL param (shareable). Click a status pill to cycle `pending → confirmed → completed → cancelled` via a Server Action.
- **Customers**: client-side search/filter, CSV export, modal CRUD. Bookings + spend are computed on the server with one extra query.

### Theme
- `ThemeProvider` reads `localStorage.fcr-theme` / `fcr-accent`, paints `data-theme="dark"` and overrides `--y` for the chosen accent.
- Layout has an inline `<script>` that applies these vars **before paint** to avoid flash.
- `ThemeChrome` mounts the WhatsApp FAB (hidden on `/admin`) and the floating theme/palette buttons.

---

## Production deployment

### Vercel
1. Push the repo to GitHub → "New Project" on Vercel → set the **Root Directory** to `web/`.
2. Add the same env vars from `.env.local` in Vercel project settings (mark `SUPABASE_SERVICE_ROLE_KEY` as server-only — it must NOT be exposed).
3. Deploy. Pages, ISR, and middleware all work out of the box.

### Supabase
- Lock `auth.enable_signup = false` in Auth settings (already false in `config.toml`). Admins are created via the script.
- Enable PITR backups on Pro plans.
- Rotate the service-role key after onboarding (the one pasted during setup).

---

## Troubleshooting

- **Dashboard SQL Editor returns weird `LINE 0` / "unterminated dollar-quoted string" errors.** It injects `-- source: dashboard` metadata into your script and confuses its statement splitter. Use `supabase db push` or the MCP `apply_migration` tool. See [APPLY_MIGRATION.md](./APPLY_MIGRATION.md).
- **Login redirects forever.** The user has a Supabase session but no row in `admin_profiles`. Either run `npm run admin:create -- email password` or manually `insert into admin_profiles(id) values ('<uuid>')`.
- **Booking insert fails with `new row violates row-level security policy`.** The `bookings_public_insert` policy must exist. Re-run the migration.
- **Images don't load on Vercel.** Add your Supabase project hostname to `next.config.mjs` → `images.remotePatterns` (already done for `*.supabase.co`).
- **Hot reload didn't pick up new env vars.** Restart `npm run dev`. Next.js only reads `.env.local` at startup.

---

## What you do next

The dev server is already running on the harness's assigned port. Final steps:

1. **Create the first admin** — `cd web && npm run admin:create -- you@example.com 'YourPassword' 'Your Name'`
2. **Open the panel** — http://localhost:PORT/admin/login → sign in.
3. **Test the booking flow** — http://localhost:PORT/booking → submit → check `/admin/bookings`, the new row should appear.
4. **Customize content** — edit cars at `/admin/cars`, edit testimonials directly in Supabase Studio, or extend the schema and re-run `npm run db:types`.
