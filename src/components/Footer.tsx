import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './icons';
import { SITE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-fcr">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <div className="logo-badge" style={{ width: 48, height: 48 }}>
                <Image src="/assets/logo.jpg" alt="" width={48} height={48} />
              </div>
              <strong>فيراري لتأجير السيارات</strong>
            </div>
            <p className="footer-about">
              الوجهة الأولى لتأجير السيارات الفاخرة في الكويت. خدمة استثنائية وأسطول متجدد على مدار الساعة.
            </p>
            <div className="footer-socials">
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" aria-label="WhatsApp"><Icon name="whatsapp" size={18} /></a>
              <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" aria-label="Instagram"><Icon name="instagram" size={18} /></a>
              <a href={`tel:${SITE.phones[0]}`} aria-label="Phone"><Icon name="phone" size={18} /></a>
              <a href={`mailto:${SITE.email}`} aria-label="Email"><Icon name="mail" size={18} /></a>
            </div>
          </div>
          <div>
            <h4>روابط سريعة</h4>
            <div className="footer-links">
              <Link href="/">الرئيسية</Link>
              <Link href="/cars">السيارات</Link>
              <Link href="/booking">احجز الآن</Link>
              <Link href="/about">عن الشركة</Link>
            </div>
          </div>
          <div className="footer-info">
            <h4>تواصل معنا</h4>
            {SITE.phones.map(p => <div key={p}><span className="num">{p}</span></div>)}
            <div>{SITE.email}</div>
          </div>
          <div className="footer-info">
            <h4>ساعات العمل</h4>
            <div>يومياً <span className="num">24/7</span></div>
            <div>الكويت — جميع المناطق</div>
            <div>تسليم في المطار</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© <span className="num">2026</span> فيراري لتأجير السيارات — جميع الحقوق محفوظة</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#">الشروط والأحكام</a>
            <a href="#">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
