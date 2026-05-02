'use client';
import { useMemo, useState, useTransition } from 'react';
import { Icon } from '@/components/icons';
import { TIER_LABELS } from '@/lib/constants';
import { fmtKwd } from '@/lib/utils';
import { deleteCustomer, upsertCustomer } from './actions';
import type { Customer, CustomerTier } from '@/lib/supabase/database.types';

type Enriched = Customer & { bookings: number; spent: number };

const empty = {
  name: '', phone: '', email: '' as string | '', tier: 'bronze' as CustomerTier, notes: '',
};

export default function CustomersTable({ customers }: { customers: Enriched[] }) {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<CustomerTier | 'all'>('all');
  const [editor, setEditor] = useState<typeof empty & { id?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = search.trim().toLowerCase();
    return customers.filter(c => {
      if (tier !== 'all' && c.tier !== tier) return false;
      if (!s) return true;
      return (
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        (c.email ?? '').toLowerCase().includes(s)
      );
    });
  }, [customers, search, tier]);

  const totals = {
    count: customers.length,
    active: customers.filter(c => c.bookings > 2).length,
    bookings: customers.reduce((a, c) => a + c.bookings, 0),
    spent: customers.reduce((a, c) => a + c.spent, 0),
  };

  function openNew() { setEditor({ ...empty }); setError(null); }
  function openEdit(c: Enriched) {
    setEditor({
      id: c.id, name: c.name, phone: c.phone,
      email: c.email ?? '', tier: c.tier, notes: c.notes ?? '',
    });
    setError(null);
  }

  function save() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      const res = await upsertCustomer({
        ...editor, email: editor.email || null, notes: editor.notes || null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditor(null);
    });
  }

  function remove(c: Enriched) {
    if (!confirm(`هل تريد حذف ${c.name}؟`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCustomer(c.id);
      if (!res.ok) {
        setError(res.error);
        alert(res.error);
      }
    });
  }

  function exportCsv() {
    const rows = [
      ['name', 'phone', 'email', 'tier', 'bookings', 'spent_kwd'],
      ...list.map(c => [c.name, c.phone, c.email ?? '', c.tier, c.bookings, c.spent]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="kpi-grid dashboard-kpis customers-kpis">
        <div className="kpi dashboard-kpi customers-kpi"><div className="ic"><Icon name="users" size={20} /></div>
          <div className="label">إجمالي العملاء</div><div className="v num">{totals.count}</div></div>
        <div className="kpi dashboard-kpi customers-kpi"><div className="ic"><Icon name="user" size={20} /></div>
          <div className="label">عملاء نشطون</div><div className="v num">{totals.active}</div></div>
        <div className="kpi dashboard-kpi customers-kpi"><div className="ic"><Icon name="calendar" size={20} /></div>
          <div className="label">إجمالي الحجوزات</div><div className="v num">{totals.bookings}</div></div>
        <div className="kpi dashboard-kpi customers-kpi"><div className="ic"><Icon name="money" size={20} /></div>
          <div className="label">إجمالي الإنفاق</div><div className="v"><span className="num">{fmtKwd(totals.spent)}</span> د.ك</div></div>
      </div>

      <div className="panel customers-panel">
        <div className="customers-panel-head">
          <h3>قائمة العملاء</h3>
          <div className="customers-controls">
            <input className="input" placeholder="ابحث..." value={search}
                   onChange={e => setSearch(e.target.value)}
                   style={{ width: 220, padding: '8px 12px', fontSize: 13 }} />
            <select
              className="select"
              value={tier}
              onChange={e => setTier(e.target.value as CustomerTier | 'all')}
              style={{ padding: '8px 12px', fontSize: 13 }}
            >
              <option value="all">كل الفئات</option>
              <option value="gold">ذهبي</option>
              <option value="silver">فضي</option>
              <option value="bronze">برونزي</option>
            </select>
            <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv}>
              <Icon name="download" size={14} /> تصدير CSV
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
              <Icon name="plus" size={14} /> عميل جديد
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl tbl-customers">
          <thead>
            <tr>
              <th className="col-customer">العميل</th><th className="col-phone">الهاتف</th><th className="col-email">البريد</th>
              <th className="col-bookings">عدد الحجوزات</th><th className="col-spent">إجمالي الإنفاق</th><th className="col-tier">التصنيف</th><th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar customer-avatar-lg">
                      {c.name[0]}
                    </div>
                    <div className="customer-name">{c.name}</div>
                  </div>
                </td>
                <td><span className="num phone-cell">{c.phone}</span></td>
                <td><span className="customer-email" dir="ltr">{c.email || '—'}</span></td>
                <td className="num">{c.bookings}</td>
                <td><span className="num">{fmtKwd(c.spent)}</span> د.ك</td>
                <td>
                  <span className={`status-chip ${
                    c.tier === 'gold' ? 'confirmed' : c.tier === 'silver' ? 'pending' : 'completed'
                  }`}>
                    {TIER_LABELS[c.tier]}
                  </span>
                </td>
                <td>
                  <div className="tbl-actions">
                    <button type="button" className="icon-btn"><Icon name="eye" size={14} /></button>
                    <button type="button" className="icon-btn" onClick={() => openEdit(c)}><Icon name="edit" size={14} /></button>
                    <button type="button" className="icon-btn danger" onClick={() => remove(c)}><Icon name="trash" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                لا يوجد عملاء.
              </td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {editor && (
        <div className="modal-bg" onClick={() => setEditor(null)}>
          <div className="modal customers-modal" onClick={e => e.stopPropagation()}>
            <h2>{editor.id ? 'تعديل العميل' : 'إضافة عميل'}</h2>
            <div className="field">
              <label>الاسم الكامل</label>
              <input className="input" value={editor.name}
                     onChange={e => setEditor({ ...editor, name: e.target.value })} />
            </div>
            <div className="field">
              <label>رقم الهاتف</label>
              <input className="input num" dir="ltr" value={editor.phone}
                     onChange={e => setEditor({ ...editor, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>البريد الإلكتروني</label>
              <input className="input" type="email" dir="ltr" value={editor.email}
                     onChange={e => setEditor({ ...editor, email: e.target.value })} />
            </div>
            <div className="field">
              <label>التصنيف</label>
              <select className="select" value={editor.tier}
                      onChange={e => setEditor({ ...editor, tier: e.target.value as CustomerTier })}>
                <option value="bronze">برونزي</option>
                <option value="silver">فضي</option>
                <option value="gold">ذهبي</option>
              </select>
            </div>
            <div className="field">
              <label>ملاحظات</label>
              <textarea className="textarea" value={editor.notes}
                        onChange={e => setEditor({ ...editor, notes: e.target.value })} />
            </div>
            {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
            <div className="customers-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditor(null)}>إلغاء</button>
              <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>
                {pending ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
