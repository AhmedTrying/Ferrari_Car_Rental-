'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './icons';
import { SITE } from '@/lib/constants';

const links = [
  { href: '/',         label: 'الرئيسية' },
  { href: '/cars',     label: 'السيارات' },
  { href: '/booking',  label: 'احجز الآن' },
  { href: '/about',    label: 'عن الشركة' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      <header className="topnav">
        <Link href="/" className="brand">
          <div className="logo-badge">
            <Image src="/assets/logo.jpg" alt="Ferrari Cars Rental" width={44} height={44} />
          </div>
          <div className="brand-text">
            <strong>فيراري لتأجير السيارات</strong>
            <small>FERRARI CARS RENTAL</small>
          </div>
        </Link>
        <nav>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-cta">
          <a href={`tel:${SITE.phones[0]}`} className="btn btn-ghost btn-sm">
            <Icon name="phone" size={16} />
            <span className="num">{SITE.phones[0]}</span>
          </a>
          <Link href="/booking" className="btn btn-primary btn-sm">احجز سيارتك</Link>
          <button className="btn btn-ghost btn-sm mobile-menu-btn" aria-label="القائمة"
                  onClick={() => setOpen(true)} style={{ display: 'none' }}>
            <Icon name="menu" size={18} />
          </button>
        </div>
      </header>
      <style jsx>{`
        @media (max-width: 900px) {
          :global(.topnav) .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>

      <div className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-bg" onClick={() => setOpen(false)} />
        <div className="drawer-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="brand" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="logo-badge" style={{ width: 36, height: 36 }}>
                <Image src="/assets/logo.jpg" alt="" width={36} height={36} />
              </div>
              <strong style={{ fontFamily: 'var(--font-cairo)', fontSize: 14 }}>فيراري</strong>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              <Icon name="close" size={16} />
            </button>
          </div>
          {links.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}
                  onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
