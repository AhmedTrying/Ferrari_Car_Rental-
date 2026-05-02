-- =============================================================
-- Seed data for development. Run via `supabase db reset`.
-- =============================================================

-- Cars
insert into public.cars (slug, name_ar, model, name_en, type, year, seats, transmission, engine, price_per_day, image_url, featured, available) values
  ('mercedes-s500',  'مرسيدس',     'S500',     'Mercedes-Benz S500',     'luxury', 2024, 5, 'أوتوماتيك', '3.0L V6',          65,  '/assets/car1.jpg', false, true),
  ('bmw-740',        'بي ام دبليو', '740',      'BMW 740 Li',             'luxury', 2024, 5, 'أوتوماتيك', '3.0L L6',          60,  '/assets/car2.jpg', false, true),
  ('rolls-cullinan', 'رولز رويس',  'كولينان',  'Rolls Royce Cullinan',   'luxury', 2023, 5, 'أوتوماتيك', '6.75L V12',        250, '/assets/car3.jpg', true,  true),
  ('porsche-911',    'بورش',       '911',      'Porsche 911 Carrera',    'sports', 2024, 4, 'PDK',       '3.0L Flat-6',      90,  '/assets/car5.jpg', false, true),
  ('exeed-rx',       'اكسيد',      'RX',       'EXEED RX',               'suv',    2024, 7, 'أوتوماتيك', '2.0L Turbo',       35,  '/assets/car7.jpg', false, true),
  ('g-class',        'جي كلاس',    'G63',      'Mercedes-AMG G63',       'suv',    2024, 5, 'أوتوماتيك', '4.0L V8',          120, '/assets/car4.jpg', false, false),
  ('urus',           'لامبورجيني', 'اوروس',    'Lamborghini Urus',       'sports', 2024, 5, 'أوتوماتيك', '4.0L Twin-Turbo V8',180, '/assets/car6.jpg', false, true),
  ('range-rover',    'رنج روفر',   'فوج',      'Range Rover Vogue',      'suv',    2024, 5, 'أوتوماتيك', '3.0L L6',          75,  '/assets/car8.jpg', false, true)
on conflict (slug) do nothing;

-- Customers
insert into public.customers (name, phone, email, tier) values
  ('محمد العتيبي',  '99887766', 'm.alotaibi@example.com',  'silver'),
  ('سارة الرشيد',   '55443322', 's.alrasheed@example.com', 'silver'),
  ('يوسف الصباح',   '66554433', 'y.alsabah@example.com',   'gold'),
  ('نورة المطيري',  '94445566', 'n.almutairi@example.com', 'bronze'),
  ('علي العنزي',    '60112233', 'a.alenezi@example.com',   'silver'),
  ('منى السالم',    '97778899', 'm.alsalem@example.com',   'bronze'),
  ('خالد الخالدي',  '69998877', 'k.alkhaled@example.com',  'bronze')
on conflict (phone) do nothing;

-- Bookings (snapshot fields filled directly)
insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1042', (select id from public.customers where phone='99887766'), (select id from public.cars where slug='mercedes-s500'),
       'محمد العتيبي', '99887766', 'مرسيدس S500', current_date - 1, 3, 195, 'confirmed'
where not exists (select 1 from public.bookings where ref = 'B-1042');

insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1041', (select id from public.customers where phone='55443322'), (select id from public.cars where slug='porsche-911'),
       'سارة الرشيد', '55443322', 'بورش 911', current_date, 2, 180, 'pending'
where not exists (select 1 from public.bookings where ref = 'B-1041');

insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1040', (select id from public.customers where phone='66554433'), (select id from public.cars where slug='rolls-cullinan'),
       'يوسف الصباح', '66554433', 'رولز رويس كولينان', current_date - 2, 1, 250, 'confirmed'
where not exists (select 1 from public.bookings where ref = 'B-1040');

insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1039', (select id from public.customers where phone='94445566'), (select id from public.cars where slug='exeed-rx'),
       'نورة المطيري', '94445566', 'اكسيد RX', current_date - 5, 5, 175, 'completed'
where not exists (select 1 from public.bookings where ref = 'B-1039');

insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1038', (select id from public.customers where phone='60112233'), (select id from public.cars where slug='bmw-740'),
       'علي العنزي', '60112233', 'بي ام دبليو 740', current_date - 8, 4, 240, 'completed'
where not exists (select 1 from public.bookings where ref = 'B-1038');

insert into public.bookings (ref, customer_id, car_id, customer_name, customer_phone, car_label, pickup_date, days, total_kwd, status)
select 'B-1037', (select id from public.customers where phone='97778899'), (select id from public.cars where slug='g-class'),
       'منى السالم', '97778899', 'جي كلاس G63', current_date - 9, 2, 240, 'cancelled'
where not exists (select 1 from public.bookings where ref = 'B-1037');

-- Testimonials
insert into public.testimonials (customer_name, text, rating) values
  ('محمد العتيبي',  'خدمة ممتازة وسيارات نظيفة. التسليم في المطار كان سريع جداً والسيارة بحالة ممتازة.', 5),
  ('فاطمة الكندري', 'تجربة استثنائية. الأسعار تنافسية والموظفون محترفون. أنصح بالتعامل معهم.',          5),
  ('أحمد الفهد',    'أفضل شركة تأجير سيارات في الكويت. التزام كامل بالمواعيد ووضوح في الأسعار.',       5)
on conflict do nothing;
