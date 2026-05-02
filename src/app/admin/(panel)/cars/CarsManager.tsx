'use client';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { Icon } from '@/components/icons';
import { CAR_TYPES } from '@/lib/constants';
import { fmtKwd } from '@/lib/utils';
import {
  upsertCar,
  deleteCar,
  toggleCarAvailability,
  uploadCarImage,
  type CarInput,
} from './actions';
import type { Car, CarType } from '@/lib/supabase/database.types';

function normalizeSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const empty: CarInput = {
  slug: '', name_ar: '', model: '', name_en: '',
  type: 'luxury', year: new Date().getFullYear(), seats: 5,
  transmission: 'أوتوماتيك', engine: '', price_per_day: 0,
  image_url: '', features: ['driver', 'insurance', 'mileage', 'no-deposit'],
  available: true, featured: false,
};

export default function CarsManager({ cars }: { cars: Car[] }) {
  const [active, setActive] = useState<CarType | 'all'>('all');
  const [editor, setEditor] = useState<CarInput | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const list = active === 'all' ? cars : cars.filter(c => c.type === active);
  const stats = {
    total: cars.length,
    available: cars.filter(c => c.available).length,
    rented: cars.filter(c => !c.available).length,
    avg: cars.length ? Math.round(cars.reduce((a, c) => a + Number(c.price_per_day), 0) / cars.length) : 0,
  };

  function openNew() { setEditor({ ...empty }); setError(null); }
  function openEdit(c: Car) {
    setEditor({
      id: c.id, slug: c.slug, name_ar: c.name_ar, model: c.model, name_en: c.name_en,
      type: c.type, year: c.year, seats: c.seats,
      transmission: c.transmission, engine: c.engine, price_per_day: Number(c.price_per_day),
      image_url: c.image_url,
      features: Array.isArray(c.features) ? (c.features as string[]) : ['driver','insurance','mileage','no-deposit'],
      available: c.available, featured: c.featured,
    });
    setError(null);
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.set('file', file);
    const res = await uploadCarImage(formData);
    if (!res.ok) {
      setError(res.error);
      return null;
    }
    return res.url;
  }

  function save() {
    if (!editor) return;
    setError(null);
    const normalizedSlug = normalizeSlug(editor.slug || '');
    if (!normalizedSlug) {
      setError('يرجى إدخال معرّف (slug) صحيح باستخدام حروف إنجليزية صغيرة وأرقام.');
      return;
    }
    const payload: CarInput = { ...editor, slug: normalizedSlug };
    if (normalizedSlug !== editor.slug) setEditor(payload);
    startTransition(async () => {
      const res = await upsertCar(payload);
      if (!res.ok) setError(res.error);
      else setEditor(null);
    });
  }

  function remove(c: Car) {
    if (!confirm(`هل تريد حذف ${c.name_ar} ${c.model}؟`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCar(c.id);
      if (!res.ok) {
        setError(res.error);
        alert(res.error);
      }
    });
  }

  function toggle(c: Car) {
    setError(null);
    startTransition(async () => {
      const res = await toggleCarAvailability(c.id, !c.available);
      if (!res.ok) {
        setError(res.error);
        alert(res.error);
      }
    });
  }

  return (
    <>
      <div className="cars-toolbar">
        <div className="filters-bar">
          {CAR_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              className={`chip ${t.id === active ? 'active' : ''}`}
              aria-pressed={t.id === active}
                    onClick={() => setActive(t.id as CarType | 'all')}>
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
          <Icon name="plus" size={14} /> إضافة سيارة
        </button>
      </div>

      <div className="kpi-grid dashboard-kpis cars-kpis">
        <div className="kpi dashboard-kpi cars-kpi"><div className="ic"><Icon name="car" size={20} /></div>
          <div className="label">إجمالي السيارات</div><div className="v num">{stats.total}</div></div>
        <div className="kpi dashboard-kpi cars-kpi"><div className="ic"><Icon name="check" size={20} /></div>
          <div className="label">متاحة</div><div className="v num">{stats.available}</div></div>
        <div className="kpi dashboard-kpi cars-kpi"><div className="ic"><Icon name="calendar" size={20} /></div>
          <div className="label">مؤجّرة حالياً</div><div className="v num">{stats.rented}</div></div>
        <div className="kpi dashboard-kpi cars-kpi"><div className="ic"><Icon name="money" size={20} /></div>
          <div className="label">متوسط السعر</div><div className="v"><span className="num">{stats.avg}</span> د.ك</div></div>
      </div>

      <div className="admin-cars-grid">
        {list.map(c => (
          <div key={c.id} className="admin-car">
            <div className="img" style={{ position: 'relative' }}>
              <Image src={c.image_url} alt={c.name_en} fill sizes="33vw" />
            </div>
            <div className={`badge-avail ${c.available ? '' : 'unavail'}`} onClick={() => toggle(c)}
                 style={{ cursor: 'pointer' }} title="انقر للتبديل">
              {c.available ? 'متاحة' : 'مؤجّرة'}
            </div>
            <div className="top-actions">
              <button type="button" className="icon-btn" style={{ background: 'rgba(255,255,255,.95)' }}
                      onClick={() => openEdit(c)}>
                <Icon name="edit" size={14} />
              </button>
              <button type="button" className="icon-btn danger" style={{ background: 'rgba(255,255,255,.95)' }}
                      onClick={() => remove(c)}>
                <Icon name="trash" size={14} />
              </button>
            </div>
            <div className="body">
              <div className="ttl">{c.name_ar} <span className="num">{c.model}</span></div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.name_en}</div>
              <div className="meta">
                <span><span className="num">{c.year}</span> · <span className="num">{c.seats}</span> ركاب</span>
                <span className="price-tag"><span className="num">{fmtKwd(Number(c.price_per_day))}</span> د.ك/يوم</span>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="cars-empty">
            لا توجد سيارات.
          </div>
        )}
      </div>

      {editor && (
        <div className="modal-bg" onClick={() => setEditor(null)}>
          <div className="modal cars-modal" onClick={e => e.stopPropagation()}>
            <h2>{editor.id ? 'تعديل السيارة' : 'إضافة سيارة'}</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="field">
                <label>صورة السيارة</label>
                <div className="car-image-upload-row">
                  {editor.image_url && (
                    <div className="car-image-preview">
                      <Image src={editor.image_url} alt="" fill sizes="100px" />
                    </div>
                  )}
                  <input className="input" type="file" accept="image/*"
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await uploadImage(f);
                      if (url) setEditor({ ...editor, image_url: url });
                    }} />
                </div>
              </div>

              <div className="car-modal-grid-2">
                <div className="field">
                  <label>الاسم بالعربي</label>
                  <input className="input" value={editor.name_ar}
                         onChange={e => setEditor({ ...editor, name_ar: e.target.value })} />
                </div>
                <div className="field">
                  <label>الموديل</label>
                  <input className="input num" value={editor.model}
                         onChange={e => setEditor({ ...editor, model: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>الاسم بالإنجليزي</label>
                <input className="input" dir="ltr" value={editor.name_en}
                       onChange={e => setEditor({ ...editor, name_en: e.target.value })} />
              </div>
              <div className="field">
                <label>المعرّف (slug)</label>
                <input className="input" dir="ltr" value={editor.slug}
                       onChange={e => setEditor({ ...editor, slug: normalizeSlug(e.target.value) })}
                       placeholder="mercedes-s500" />
                <small style={{ color: 'var(--muted)', fontSize: 12 }}>
                  يُحوّل تلقائياً إلى صيغة URL (a-z, 0-9, -)
                </small>
              </div>
              <div className="car-modal-grid-3">
                <div className="field">
                  <label>الفئة</label>
                  <select className="select" value={editor.type}
                          onChange={e => setEditor({ ...editor, type: e.target.value as CarType })}>
                    <option value="luxury">فاخرة</option>
                    <option value="suv">دفع رباعي</option>
                    <option value="sports">رياضية</option>
                  </select>
                </div>
                <div className="field">
                  <label>السنة</label>
                  <input className="input num" type="number" value={editor.year}
                         onChange={e => setEditor({ ...editor, year: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label>عدد الركاب</label>
                  <input className="input num" type="number" min={1} max={12} value={editor.seats}
                         onChange={e => setEditor({ ...editor, seats: Number(e.target.value) })} />
                </div>
              </div>
              <div className="car-modal-grid-3">
                <div className="field">
                  <label>ناقل الحركة</label>
                  <input className="input" value={editor.transmission}
                         onChange={e => setEditor({ ...editor, transmission: e.target.value })} />
                </div>
                <div className="field">
                  <label>المحرّك</label>
                  <input className="input" value={editor.engine}
                         onChange={e => setEditor({ ...editor, engine: e.target.value })} />
                </div>
                <div className="field">
                  <label>السعر / يوم (د.ك)</label>
                  <input className="input num" type="number" min={0} value={editor.price_per_day}
                         onChange={e => setEditor({ ...editor, price_per_day: Number(e.target.value) })} />
                </div>
              </div>

              <div className="car-modal-switches">
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={editor.available}
                         onChange={e => setEditor({ ...editor, available: e.target.checked })} />
                  متاحة للحجز
                </label>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={editor.featured}
                         onChange={e => setEditor({ ...editor, featured: e.target.checked })} />
                  مميّزة (Hero)
                </label>
              </div>

              {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}

              <div className="cars-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditor(null)}>إلغاء</button>
                <button type="submit" className="btn btn-primary" disabled={pending}>
                  {pending ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
