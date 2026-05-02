import Image from 'next/image';
import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata = { title: 'تسجيل الدخول — لوحة التحكم' };

export default function LoginPage({ searchParams }: { searchParams: { error?: string; next?: string } }) {
  return (
    <div className="login-body">
      <div className="login-grid">
        <div className="login-side">
          <div className="checker-strip" style={{ marginBottom: 24 }} />
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="logo-badge">
              <Image src="/assets/logo.jpg" alt="" width={44} height={44} />
            </div>
            <div className="brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ color: '#fff', fontFamily: 'var(--font-cairo)' }}>فيراري لتأجير السيارات</strong>
              <small style={{ color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-mono)', letterSpacing: '.1em' }}>
                FERRARI CARS RENTAL · ADMIN
              </small>
            </div>
          </div>
          <h1 className="display" style={{ color: '#fff', fontSize: 48, marginTop: 48 }}>
            لوحة<br/><span style={{ color: 'var(--y)' }}>التحكم</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, maxWidth: 420 }}>
            إدارة الحجوزات، السيارات والعملاء من مكان واحد.
          </p>
        </div>
        <div className="login-form-wrap">
          <LoginForm next={searchParams.next} initialError={searchParams.error} />
        </div>
      </div>
    </div>
  );
}
