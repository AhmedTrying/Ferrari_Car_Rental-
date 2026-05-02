import Image from 'next/image';
import TopNav from '@/components/TopNav';
import Footer from '@/components/Footer';
import ThemeChrome from '@/components/ThemeChrome';
import { Icon } from '@/components/icons';
import { SITE } from '@/lib/constants';

export const metadata = { title: 'عن الشركة — فيراري لتأجير السيارات' };

const values = [
  { t: 'الجودة', d: 'سيارات حديثة وصيانة دورية قبل كل تأجير.', i: 'sparkle' },
  { t: 'الثقة',  d: 'تأمين شامل وأسعار شفافة بدون رسوم خفية.', i: 'shield' },
  { t: 'الراحة', d: 'تسليم في المطار وخدمة 24/7 طوال أيام الأسبوع.', i: 'cog' },
];

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <section className="about-hero">
        <div className="container-fcr">
          <div className="checker-strip" style={{ marginBottom: 32 }} />
          <div className="about-hero-grid">
            <div>
              <div className="eyebrow" style={{ color: '#fff' }}>عن الشركة</div>
              <h1 className="display">خبرة تتجاوز<br/><span className="y"><span className="num">10</span> سنوات</span></h1>
              <p className="lead">
                بدأت رحلتنا بشغف لتقديم تجربة تأجير سيارات فاخرة لا مثيل لها في الكويت.
                اليوم، نفخر بأسطولنا المتجدد وثقة آلاف العملاء.
              </p>
              <div className="about-stats">
                {[['50+','سيارة فاخرة'],['5,300+','عميل سعيد'],['10','سنوات خبرة'],['4.9','تقييم العملاء']].map(([v,l]) => (
                  <div key={l} className="about-stat">
                    <div className="v num">{v}</div><div className="l">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-img">
              <Image src="/assets/car3.jpg" alt="" width={600} height={750} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fcr">
          <div className="eyebrow">مهمتنا</div>
          <h2 className="display" style={{ fontSize: 40, maxWidth: 720 }}>
            تجربة قيادة فاخرة في متناول الجميع — بأعلى معايير الجودة والخدمة.
          </h2>
          <div className="values-grid">
            {values.map(v => (
              <div key={v.t} className="card value-card">
                <div className="ic-box"><Icon name={v.i} size={26} /></div>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-fcr">
          <div className="contact-grid">
            <a className="contact-card wa" href={`https://wa.me/${SITE.whatsapp}`} target="_blank">
              <div className="ic-circle"><Icon name="whatsapp" size={26} /></div>
              <div style={{ flex: 1 }}>
                <div className="label">تواصل فوري</div><h4>واتساب</h4>
                <div className="sub num">{SITE.whatsapp}</div>
              </div>
              <Icon name="arrow" size={22} />
            </a>
            <a className="contact-card ph" href={`tel:${SITE.phones[0]}`}>
              <div className="ic-circle"><Icon name="phone" size={26} /></div>
              <div style={{ flex: 1 }}>
                <div className="label">متاح 24/7</div><h4>اتصل بنا</h4>
                <div className="sub num">{SITE.phones.join(' — ')}</div>
              </div>
              <Icon name="arrow" size={22} />
            </a>
            <a className="contact-card ig" href={`https://instagram.com/${SITE.instagram}`} target="_blank">
              <div className="ic-circle"><Icon name="instagram" size={26} /></div>
              <div style={{ flex: 1 }}>
                <div className="label">تابعنا</div><h4>انستقرام</h4>
                <div className="sub num">@{SITE.instagram}</div>
              </div>
              <Icon name="arrow" size={22} />
            </a>
          </div>
        </div>
      </section>
      <Footer />
      <ThemeChrome />
    </>
  );
}
