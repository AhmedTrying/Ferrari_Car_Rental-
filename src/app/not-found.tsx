import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 40,
    }}>
      <div>
        <div className="checker-strip" style={{ width: 120, margin: '0 auto 24px' }} />
        <h1 className="display" style={{ fontSize: 80, color: 'var(--y)' }}>
          <span className="num">404</span>
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>الصفحة غير موجودة.</p>
        <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
