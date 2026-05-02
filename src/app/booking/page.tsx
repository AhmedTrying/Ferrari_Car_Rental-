import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import ThemeChrome from '@/components/ThemeChrome';
import BookingForm from './BookingForm';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'احجز سيارة — فيراري لتأجير السيارات' };

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { car?: string };
}) {
  const supabase = createClient();
  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('available', { ascending: false })
    .order('price_per_day');

  return (
    <>
      <TopNav />
      <div className="checker-strip" />
      <section className="section">
        <div className="container-fcr">
          <div className="eyebrow">احجز سيارتك بسهولة</div>
          <h1 className="display" style={{ fontSize: 40, marginBottom: 8 }}>طلب حجز سيارة</h1>
          <p style={{ color: 'var(--muted)' }}>
            املأ النموذج وسيتواصل معك فريقنا خلال <span className="num">15</span> دقيقة.
          </p>
          <BookingForm cars={cars ?? []} preselectSlug={searchParams.car} />
        </div>
      </section>
      <Footer />
      <ThemeChrome />
    </>
  );
}
