import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Icon } from '@/components/icons';
import RevenueChart from '@/components/admin/RevenueChart';
import { STATUS_LABELS } from '@/lib/constants';
import { fmtKwd } from '@/lib/utils';
import { fetchAdminBookings } from '@/lib/admin/bookings';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [
    { data: kpis },
    { data: revenueRows },
    { data: topCars },
    { data: recentBookings, error: recentBookingsError },
  ] = await Promise.all([
    supabase.from('v_kpis').select('*').single(),
    supabase.from('v_revenue_monthly').select('*').limit(12),
    supabase.from('v_top_cars').select('*').limit(4),
    fetchAdminBookings(supabase, { limit: 5 }),
  ]);

  if (recentBookingsError) {
    console.error('dashboard recent bookings query error', recentBookingsError);
  }

  const kpiCards = [
    { label: 'الإيرادات هذا الشهر', v: `${fmtKwd(Number(kpis?.revenue_month ?? 0))} د.ك`, ic: 'money' },
    { label: 'الحجوزات النشطة',    v: String(kpis?.active_bookings ?? 0),                ic: 'calendar' },
    { label: 'السيارات المتاحة',  v: `${kpis?.cars_available ?? 0} / ${kpis?.cars_total ?? 0}`, ic: 'car' },
    { label: 'عملاء جدد',          v: String(kpis?.new_customers ?? 0),                  ic: 'users' },
  ];

  return (
    <>
      <div className="kpi-grid dashboard-kpis">
        {kpiCards.map(k => (
          <div key={k.label} className="kpi dashboard-kpi">
            <div className="ic"><Icon name={k.ic} size={20} /></div>
            <div className="label">{k.label}</div>
            <div className="v num">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="cols-2 dashboard-cols-2">
        <div className="panel">
          <div className="panel-head">
            <h3>الإيرادات الشهرية</h3>
            <button className="btn btn-ghost btn-sm">
              <Icon name="download" size={14} /> تصدير
            </button>
          </div>
          <RevenueChart data={(revenueRows ?? []).filter(r => r.ym && r.revenue != null).map(r => ({ ym: r.ym!, revenue: Number(r.revenue) }))} />
        </div>

        <div className="panel">
          <div className="panel-head"><h3>السيارات الأكثر تأجيراً</h3></div>
          <div className="top-cars-list">
            {(topCars ?? []).map((c, i) => (
              <div key={c.id ?? i} className="top-car-card">
                <div className="top-car-thumb">
                  <Image src={c.image_url ?? '/assets/logo.jpg'} alt={c.name_ar ?? ''} fill sizes="64px" />
                </div>
                <div className="top-car-body">
                  <div className="top-car-name">
                    {c.name_ar} <span className="num">{c.model}</span>
                  </div>
                  <div className="top-car-meta">
                    <span className="num">{c.rentals}</span> حجز
                  </div>
                </div>
                <div className="top-car-rank">#{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel dashboard-recent-bookings">
        <div className="panel-head">
          <h3>أحدث الحجوزات</h3>
          <Link href="/admin/bookings" className="btn btn-ghost btn-sm">
            عرض الكل <Icon name="arrowL" size={14} />
          </Link>
        </div>
        <div className="tbl-wrap">
          <table className="tbl tbl-bookings">
            <thead>
              <tr>
                <th className="col-ref">رقم الحجز</th>
                <th className="col-customer">العميل</th>
                <th className="col-car">السيارة</th>
                <th className="col-date">التاريخ</th>
                <th className="col-days">الأيام</th>
                <th className="col-total">الإجمالي</th>
                <th className="col-status">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {(recentBookings ?? []).map(b => (
                <tr key={b.id}>
                  <td className="num">{b.ref}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.car_label}</td>
                  <td className="num">{b.pickup_date}</td>
                  <td className="num">{b.days}</td>
                  <td><span className="num">{fmtKwd(Number(b.total_kwd))}</span> د.ك</td>
                  <td><span className={`status-chip ${b.status}`}>{STATUS_LABELS[b.status]}</span></td>
                </tr>
              ))}
              {(recentBookings ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    لا توجد حجوزات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
