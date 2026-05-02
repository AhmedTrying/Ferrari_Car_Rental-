'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/icons';
import { STATUS_LABELS } from '@/lib/constants';
import { fmtKwd } from '@/lib/utils';
import { deleteBooking, updateBookingDetails, updateBookingStatus } from './actions';
import { createClient } from '@/lib/supabase/client';
import type { BookingStatus } from '@/lib/supabase/database.types';
import type { AdminBookingRow } from '@/lib/admin/bookings';

const FILTERS = [
  { id: 'all',       label: 'الكل' },
  { id: 'pending',   label: 'قيد المراجعة' },
  { id: 'confirmed', label: 'مؤكدة' },
  { id: 'completed', label: 'مكتملة' },
  { id: 'cancelled', label: 'ملغاة' },
];

const STATUS_OPTIONS: { id: BookingStatus; label: string }[] = [
  { id: 'pending', label: STATUS_LABELS.pending },
  { id: 'confirmed', label: STATUS_LABELS.confirmed },
  { id: 'completed', label: STATUS_LABELS.completed },
  { id: 'cancelled', label: STATUS_LABELS.cancelled },
];

type EditFormState = {
  id: string;
  ref: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  car_label: string;
  pickup_date: string;
  days: string;
  total_kwd: string;
  status: BookingStatus;
  destination: string;
  passengers: string;
  notes: string;
};

function toEditFormState(b: AdminBookingRow): EditFormState {
  return {
    id: b.id,
    ref: b.ref,
    customer_id: b.customer_id ?? null,
    customer_name: b.customer_name ?? '',
    customer_phone: b.customer_phone ?? '',
    customer_email: b.customer_email ?? '',
    car_label: b.car_label ?? '',
    pickup_date: b.pickup_date ?? '',
    days: String(b.days ?? ''),
    total_kwd: String(b.total_kwd ?? ''),
    status: b.status,
    destination: b.destination ?? '',
    passengers: b.passengers == null ? '' : String(b.passengers),
    notes: b.notes ?? '',
  };
}

export default function BookingsTable({
  bookings, totalCount, activeStatus,
}: { bookings: AdminBookingRow[]; totalCount: number; activeStatus: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<AdminBookingRow | null>(null);
  const [editing, setEditing] = useState<EditFormState | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  const setFilter = (s: string) => {
    const params = new URLSearchParams(sp);
    if (s === 'all') params.delete('status'); else params.set('status', s);
    router.replace(`/admin/bookings?${params}`);
  };

  const changeStatus = (b: AdminBookingRow, next: BookingStatus) => {
    if (b.status === next) return;
    startTransition(async () => {
      const result = await updateBookingStatus(b.id, next);
      if (!result?.ok) {
        alert(result?.error ?? 'تعذر تحديث حالة الحجز.');
      }
    });
  };

  const remove = (b: AdminBookingRow) => {
    if (!confirm(`هل تريد حذف الحجز ${b.ref}؟`)) return;
    startTransition(async () => {
      const result = await deleteBooking(b.id);
      if (!result?.ok) {
        alert(result?.error ?? 'تعذر حذف الحجز.');
      }
    });
  };

  const setEditField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const saveEdit = () => {
    if (!editing) return;

    const days = Number.parseInt(editing.days, 10);
    const total = Number(editing.total_kwd);
    const passengers =
      editing.passengers.trim() === '' ? null : Number.parseInt(editing.passengers, 10);

    startTransition(async () => {
      const result = await updateBookingDetails({
        id: editing.id,
        customer_id: editing.customer_id,
        customer_name: editing.customer_name,
        customer_phone: editing.customer_phone,
        customer_email: editing.customer_email,
        car_label: editing.car_label,
        pickup_date: editing.pickup_date,
        days,
        total_kwd: total,
        status: editing.status,
        destination: editing.destination,
        passengers,
        notes: editing.notes,
      });

      if (!result?.ok) {
        alert(result?.error ?? 'تعذر حفظ بيانات الحجز.');
        return;
      }
      setEditing(null);
    });
  };

  return (
    <>
      <div className="bookings-toolbar">
        <div className="filters-bar">
          {FILTERS.map(s => (
            <button key={s.id} className={`chip ${s.id === activeStatus ? 'active' : ''}`}
                    onClick={() => setFilter(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> تصدير</button>
          <Link href="/booking" className="btn btn-primary btn-sm">
            <Icon name="plus" size={14} /> حجز جديد
          </Link>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl tbl-bookings">
            <thead>
              <tr>
                <th className="col-ref">رقم</th>
                <th className="col-customer">العميل</th>
                <th className="col-phone">الهاتف</th>
                <th className="col-car">السيارة</th>
                <th className="col-date">التاريخ</th>
                <th className="col-days">أيام</th>
                <th className="col-total">الإجمالي</th>
                <th className="col-status">الحالة</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="num">{b.ref}</td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {b.customer_name?.trim()?.[0] ?? '؟'}
                      </div>
                      {b.customer_name}
                    </div>
                  </td>
                  <td><span className="num phone-cell">{b.customer_phone}</span></td>
                  <td>{b.car_label}</td>
                  <td className="num">{b.pickup_date}</td>
                  <td className="num">{b.days}</td>
                  <td><span className="num">{fmtKwd(Number(b.total_kwd))}</span> د.ك</td>
                  <td>
                    <select
                      className={`status-select ${b.status}`}
                      value={b.status}
                      onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                      disabled={pending}
                      title="تغيير حالة الحجز"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="tbl-actions">
                      <button type="button" className="icon-btn" title="عرض" onClick={() => setPreview(b)}>
                        <Icon name="eye" size={14} />
                      </button>
                      <button type="button" className="icon-btn" title="تعديل الحجز" onClick={() => setEditing(toEditFormState(b))}>
                        <Icon name="edit" size={14} />
                      </button>
                      <button type="button" className="icon-btn danger" title="حذف" onClick={() => remove(b)} disabled={pending}>
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                    لا توجد حجوزات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bookings-footer">
          <span>
            عرض <strong className="num" style={{ color: 'var(--ink)' }}>{bookings.length}</strong> من{' '}
            <strong className="num" style={{ color: 'var(--ink)' }}>{totalCount}</strong> حجز
          </span>
        </div>
      </div>

      {preview && (
        <div className="modal-bg" onClick={() => setPreview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              تفاصيل الحجز <span className="num">{preview.ref}</span>
            </h2>
            <div className="booking-preview-grid">
              <div><strong>العميل:</strong> {preview.customer_name}</div>
              <div><strong>الهاتف:</strong> <span className="num">{preview.customer_phone}</span></div>
              <div><strong>السيارة:</strong> {preview.car_label}</div>
              <div><strong>تاريخ الاستلام:</strong> <span className="num">{preview.pickup_date}</span></div>
              <div><strong>عدد الأيام:</strong> <span className="num">{preview.days}</span></div>
              <div><strong>الإجمالي:</strong> <span className="num">{fmtKwd(Number(preview.total_kwd))}</span> د.ك</div>
              <div>
                <strong>الحالة:</strong>{' '}
                <span className={`status-chip ${preview.status}`}>{STATUS_LABELS[preview.status]}</span>
              </div>
              <div className="booking-preview-notes">
                <strong>الملاحظات:</strong>{' '}
                {preview.notes?.trim() ? preview.notes : 'لا توجد ملاحظات.'}
              </div>
            </div>
            <div className="booking-preview-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
                إغلاق
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditing(toEditFormState(preview));
                  setPreview(null);
                }}
              >
                تعديل الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-bg" onClick={() => setEditing(null)}>
          <div className="modal booking-edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              تعديل الحجز <span className="num">{editing.ref}</span>
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
            >
              <div className="booking-edit-grid">
                <div className="field">
                  <label>اسم العميل</label>
                  <input
                    className="input"
                    value={editing.customer_name}
                    onChange={(e) => setEditField('customer_name', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>الهاتف</label>
                  <input
                    className="input num"
                    dir="ltr"
                    value={editing.customer_phone}
                    onChange={(e) => setEditField('customer_phone', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>البريد الإلكتروني</label>
                  <input
                    className="input"
                    dir="ltr"
                    value={editing.customer_email}
                    onChange={(e) => setEditField('customer_email', e.target.value)}
                    placeholder="اختياري"
                  />
                </div>
                <div className="field">
                  <label>السيارة</label>
                  <input
                    className="input"
                    value={editing.car_label}
                    onChange={(e) => setEditField('car_label', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>تاريخ الاستلام</label>
                  <input
                    className="input num"
                    type="date"
                    value={editing.pickup_date}
                    onChange={(e) => setEditField('pickup_date', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>الحالة</label>
                  <select
                    className={`select status-select ${editing.status}`}
                    value={editing.status}
                    onChange={(e) => setEditField('status', e.target.value as BookingStatus)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>عدد الأيام</label>
                  <input
                    className="input num"
                    type="number"
                    min={1}
                    max={60}
                    value={editing.days}
                    onChange={(e) => setEditField('days', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>الإجمالي (د.ك)</label>
                  <input
                    className="input num"
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.total_kwd}
                    onChange={(e) => setEditField('total_kwd', e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>الوجهة</label>
                  <input
                    className="input"
                    value={editing.destination}
                    onChange={(e) => setEditField('destination', e.target.value)}
                    placeholder="اختياري"
                  />
                </div>
                <div className="field">
                  <label>عدد الركاب</label>
                  <input
                    className="input num"
                    type="number"
                    min={1}
                    max={9}
                    value={editing.passengers}
                    onChange={(e) => setEditField('passengers', e.target.value)}
                    placeholder="اختياري"
                  />
                </div>
                <div className="field booking-edit-notes">
                  <label>ملاحظات</label>
                  <textarea
                    className="textarea"
                    value={editing.notes}
                    onChange={(e) => setEditField('notes', e.target.value)}
                    placeholder="اختياري"
                  />
                </div>
              </div>

              <div className="booking-preview-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
                  {pending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
