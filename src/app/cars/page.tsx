import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import ThemeChrome from '@/components/ThemeChrome';
import CarFilters from '@/components/CarFilters';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = { title: 'السيارات — فيراري لتأجير السيارات' };

export default async function CarsPage() {
  const supabase = createClient();
  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('available', { ascending: false })
    .order('price_per_day');

  return (
    <>
      <TopNav />
      <section className="page-hero">
        <div className="container-fcr">
          <div className="eyebrow">أسطول السيارات</div>
          <h1 className="display">اختر سيارتك المثالية</h1>
          <p>
            تصفح <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{cars?.length ?? 0}+</span> سيارة
            فاخرة بأحدث الموديلات. جميع السيارات تشمل التأمين الشامل والعداد المفتوح.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container-fcr">
          <CarFilters cars={cars ?? []} />
        </div>
      </section>
      <Footer />
      <ThemeChrome />
    </>
  );
}
