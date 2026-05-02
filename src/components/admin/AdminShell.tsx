'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/icons';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin',           label: 'الرئيسية',  icon: 'dashboard' },
  { href: '/admin/bookings',  label: 'الحجوزات', icon: 'calendar' },
  { href: '/admin/cars',      label: 'السيارات', icon: 'car' },
  { href: '/admin/customers', label: 'العملاء',  icon: 'users' },
];
const PAGE_TITLE: Record<string, string> = {
  '/admin': 'لوحة التحكم',
  '/admin/bookings': 'إدارة الحجوزات',
  '/admin/cars': 'إدارة السيارات',
  '/admin/customers': 'قاعدة العملاء',
};

export default function AdminShell({
  children, userInitial, userName,
}: { children: React.ReactNode; userInitial?: string; userName?: string }) {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const [sideOpen, setSideOpen] = useState(false);
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className={`app-side ${sideOpen ? 'open' : ''}`}>
        <Link href="/admin" className="brand">
          <div className="logo-badge" style={{ width: 38, height: 38 }}>
            <Image src="/assets/logo.jpg" alt="" width={38} height={38} />
          </div>
          <div>
            <strong>فيراري للتأجير</strong>
            <small>ADMIN PANEL</small>
          </div>
        </Link>
        <nav className="app-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}
                  onClick={() => setSideOpen(false)}>
              <Icon name={l.icon} size={18} /> {l.label}
            </Link>
          ))}
        </nav>
        <div className="app-side-foot">
          <a href="#"><Icon name="cog" size={18} /> الإعدادات</a>
          <button onClick={logout}><Icon name="logout" size={18} /> تسجيل الخروج</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-top">
          <div className="app-top-leading">
            <button
              type="button"
              className="app-top-icon mobile-only"
              onClick={() => setSideOpen(o => !o)}
              aria-label="القائمة"
            >
              <Icon name="menu" size={18} />
            </button>
            <h1>{PAGE_TITLE[pathname] ?? 'لوحة التحكم'}</h1>
          </div>
          <div className="app-top-actions">
            <div className="app-search desktop-only">
              <Icon name="search" size={16} />
              <input placeholder="ابحث عن حجز، عميل، سيارة..." />
            </div>
            <button type="button" className="app-top-icon" aria-label="الإشعارات">
              <Icon name="bell" size={18} />
              <span className="dot" />
            </button>
            <div className="app-top-user">
              <div className="avatar">{userInitial ?? 'A'}</div>
              <div style={{ fontSize: 13, lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700 }}>{userName ?? 'المدير'}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11 }}>مسؤول</div>
              </div>
            </div>
          </div>
        </header>
        <div className="app-body">{children}</div>
      </div>
    </div>
  );
}
