import Image from 'next/image';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import ThemeChrome from '@/components/ThemeChrome';
import CarFilters from '@/components/CarFilters';
import { Icon, Stars } from '@/components/icons';
import { createClient } from '@/lib/supabase/server';
import { SITE } from '@/lib/constants';

export const revalidate = 60; // ISR — refresh hourly is too cold; refresh every minute

export default async function HomePage() {
  const supabase = createClient();
  const [{ data: cars }, { data: testimonials }, { data: featured }] = await Promise.all([
    supabase.from('cars').select('*').eq('available', true).order('created_at'),
    supabase.from('testimonials').select('*').eq('published', true).limit(3),
    supabase.from('cars').select('*').eq('featured', true).limit(1).single(),
  ]);
  const safeCars = cars ?? [];
  const hero = featured ?? safeCars[0];

  const features = [
    { id: 'driver', label: 'سيارة مع سائق', icon: 'driver' },
    { id: 'no-deposit', label: 'بدون كمبيالة', icon: 'no-deposit' },
    { id: 'insurance', label: 'تأمين شامل', icon: 'shield' },
    { id: 'mileage', label: 'عداد مفتوح', icon: 'gauge' },
  ];

  return (
    <>
      <TopNav />

      <main>
        <section className="hero">
          <div className="checker-strip" />
          <div className="container-fcr">
            <div className="hero-grid">
              <div>
                <div className="eyebrow">تأجير سيارات فاخرة في الكويت</div>
                <h1 className="display">قُد تجربة<br/><span className="highlight"><span>استثنائية</span></span></h1>
                <p className="lead">
                  أكثر من <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>50</span> سيارة فاخرة
                  بأحدث الموديلات. خدمة تسليم في المطار، تأمين شامل، وبدون كمبيالة.
                </p>
                <div className="hero-actions">
                  <Link href="/booking" className="btn btn-primary btn-lg">احجز الآن</Link>
                  <Link href="/cars" className="btn btn-ghost btn-lg">تصفح السيارات</Link>
                </div>
                <div className="hero-stats">
                  {[
                    ['50+', 'سيارة فاخرة'], ['5,300+', 'عميل سعيد'],
                    ['24/7', 'خدمة متواصلة'], ['4.9', 'تقييم العملاء'],
                  ].map(([v, l]) => (
                    <div key={l} className="hero-stat">
                      <div className="v num">{v}</div><div className="l">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {hero && (
                <div className="hero-card-wrap">
                  <div className="hero-card">
                    <div className="img-wrap">
                      <Image src={hero.image_url} alt={hero.name_en} fill sizes="(max-width:900px) 100vw, 500px" />
                      <div style={{ position: 'absolute', top: 16, insetInlineStart: 16 }}>
                        <span className="yellow-tag">الأكثر طلباً</span>
                      </div>
                      <div className="price-tag">
                        <div style={{ fontSize: 12, opacity: .7 }}>يبدأ من</div>
                        <div>
                          <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>{hero.price_per_day}</span>{' '}
                          <span style={{ fontSize: 13 }}>د.ك / يوم</span>
                        </div>
                      </div>
                    </div>
                    <div className="hero-card-meta">
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>الأكثر تأجيراً</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-cairo)' }}>
                          {hero.name_ar} <span className="num">{hero.model}</span>
                        </div>
                      </div>
                      <Link href={`/booking?car=${hero.slug}`} className="btn btn-dark btn-sm">عرض التفاصيل</Link>
                    </div>
                  </div>
                  <div className="hero-floating-card">
                    <Icon name="shield" size={28} />
                    <div>
                      <strong style={{ fontSize: 14, display: 'block' }}>تأمين شامل</strong>
                      <span style={{ fontSize: 12 }}>على جميع السيارات</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features-strip">
          <div className="container-fcr">
            <div className="features-grid">
              {features.map(f => (
                <div key={f.id} className="feature-block">
                  <div className="ic-box"><Icon name={f.icon} size={26} /></div>
                  <div>
                    <strong>{f.label}</strong>
                    <span>على جميع السيارات</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-fcr">
            <div className="section-head">
              <div>
                <div className="eyebrow">اختر سيارتك</div>
                <h2 className="display">أسطول من الفخامة</h2>
              </div>
            </div>
            <CarFilters cars={safeCars} limit={6} />
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/cars" className="btn btn-dark">عرض جميع السيارات</Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container-fcr">
            <div className="contact-grid">
              <a className="contact-card wa" href={`https://wa.me/${SITE.whatsapp}`} target="_blank">
                <div className="ic-circle"><Icon name="whatsapp" size={26} /></div>
                <div style={{ flex: 1 }}>
                  <div className="label">تواصل فوري</div>
                  <h4>واتساب</h4>
                  <div className="sub num">{SITE.whatsapp}</div>
                </div>
                <Icon name="arrow" size={22} />
              </a>
              <a className="contact-card ph" href={`tel:${SITE.phones[0]}`}>
                <div className="ic-circle"><Icon name="phone" size={26} /></div>
                <div style={{ flex: 1 }}>
                  <div className="label">متاح <span className="num">24/7</span></div>
                  <h4>اتصل بنا</h4>
                  <div className="sub num">{SITE.phones.join(' — ')}</div>
                </div>
                <Icon name="arrow" size={22} />
              </a>
              <a className="contact-card ig" href={`https://instagram.com/${SITE.instagram}`} target="_blank">
                <div className="ic-circle"><Icon name="instagram" size={26} /></div>
                <div style={{ flex: 1 }}>
                  <div className="label">تابعنا</div>
                  <h4>انستقرام</h4>
                  <div className="sub num">@{SITE.instagram}</div>
                </div>
                <Icon name="arrow" size={22} />
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-fcr">
            <div className="eyebrow">آراء عملائنا</div>
            <h2 className="display" style={{ fontSize: 40, marginBottom: 28 }}>
              أكثر من <span className="num">5,300</span> عميل وثقوا فينا
            </h2>
            <div className="testimonials-grid">
              {(testimonials ?? []).map(t => (
                <div key={t.id} className="testimonial">
                  <Stars n={t.rating} />
                  <p>« {t.text} »</p>
                  <div className="who">
                    <div className="avatar">{t.customer_name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.customer_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>عميل موثّق</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ThemeChrome />
    </>
  );
}
