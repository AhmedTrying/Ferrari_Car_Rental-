'use client';
import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import { Icon } from '@/components/icons';
import { buildBookingWaText, fmtKwd, tomorrowIso, waLink } from '@/lib/utils';
import { submitBooking } from './actions';
import type { Car } from '@/lib/supabase/database.types';

export default function BookingForm({ cars, preselectSlug }: { cars: Car[]; preselectSlug?: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pending, startTransition] = useTransition();
  const initialCar = preselectSlug ? cars.find(c => c.slug === preselectSlug)?.id : '';

  const [form, setForm] = useState({
    car_id: initialCar ?? '',
    pickup_date: tomorrowIso(),
    days: 1,
    destination: '',
    passengers: 2,
    notes: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<{ ref: string } | null>(null);

  const car = useMemo(() => cars.find(c => c.id === form.car_id), [form.car_id, cars]);
  const total = car ? car.price_per_day * (Number(form.days) || 1) : 0;

  const update = (k: keyof typeof form, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  function next() {
    if (!form.car_id) {
      setErrors({ car_id: 'يرجى اختيار السيارة' });
      return;
    }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildWa(): string {
    return buildBookingWaText({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      car_label: car ? `${car.name_ar} ${car.model}` : '',
      pickup_date: form.pickup_date,
      days: form.days,
      destination: form.destination,
      passengers: form.passengers,
      notes: form.notes,
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!car) return;
    startTransition(async () => {
      const res = await submitBooking({
        car_id: car.id,
        car_label: `${car.name_ar} ${car.model}`,
        pickup_date: form.pickup_date,
        days: form.days,
        destination: form.destination,
        passengers: form.passengers,
        notes: form.notes,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        total_kwd: total,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? { _: res.error });
        return;
      }
      setErrors({});
      setSubmitted({ ref: res.ref });
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return (
    <>
      <div className="steps-bar">
        <div className={`step ${step >= 1 ? (step === 1 ? 'active' : 'done') : ''}`}>
          <div className="step-num">1</div><div className="step-label">التفاصيل</div>
        </div>
        <div className={`step-line ${step > 1 ? 'done' : ''}`} />
        <div className={`step ${step >= 2 ? (step === 2 ? 'active' : 'done') : ''}`}>
          <div className="step-num">2</div><div className="step-label">بيانات الاتصال</div>
        </div>
        <div className={`step-line ${step > 2 ? 'done' : ''}`} />
        <div className={`step ${step === 3 ? 'active' : ''}`}>
          <div className="step-num">3</div><div className="step-label">تأكيد</div>
        </div>
      </div>

      <div className="booking-grid">
        <form className="card" style={{ padding: 24 }} onSubmit={onSubmit} noValidate>
          {step === 1 && (
            <div>
              <div className="field">
                <label>اختر السيارة</label>
                <div className="car-pick-grid">
                  {cars.map(c => (
                    <button
                      type="button"
                      key={c.id}
                      className={`car-pick ${form.car_id === c.id ? 'is-selected' : ''}`}
                      onClick={() => { update('car_id', c.id); setErrors(prev => ({ ...prev, car_id: '' })); }}
                      aria-pressed={form.car_id === c.id}
                    >
                      <div className="car-pick-img">
                        <Image src={c.image_url} alt={c.name_en} fill sizes="(max-width:700px) 100vw, 33vw" />
                        <span className="car-pick-price">
                          <span className="num">{c.price_per_day}</span> د.ك<span className="s">/يوم</span>
                        </span>
                        {form.car_id === c.id && (
                          <span className="car-pick-check"><Icon name="check" size={18} /></span>
                        )}
                      </div>
                      <div className="car-pick-body">
                        <div className="car-pick-title">
                          <strong>{c.name_ar} <span className="num">{c.model}</span></strong>
                          <span className="sub">{c.name_en}</span>
                        </div>
                        <div className="car-pick-feats">
                          <span className="feature-pill"><span className="ic"><Icon name="driver" size={12} /></span>مع سائق</span>
                          <span className="feature-pill"><span className="ic"><Icon name="shield" size={12} /></span>تأمين شامل</span>
                          <span className="feature-pill"><span className="ic"><Icon name="no-deposit" size={12} /></span>بدون كمبيالة</span>
                          <span className="feature-pill"><span className="ic"><Icon name="gauge" size={12} /></span>عداد مفتوح</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.car_id && <div className="err">{errors.car_id}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>تاريخ الاستلام</label>
                  <input className="input num" type="date" value={form.pickup_date}
                         onChange={e => update('pickup_date', e.target.value)} required />
                </div>
                <div className="field">
                  <label>عدد الأيام</label>
                  <input className="input num" type="number" min={1} max={60} value={form.days}
                         onChange={e => update('days', Number(e.target.value))} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>الوجهة / المنطقة</label>
                  <input className="input" placeholder="مثال: المطار → السالمية" value={form.destination}
                         onChange={e => update('destination', e.target.value)} />
                </div>
                <div className="field">
                  <label>عدد الركاب</label>
                  <input className="input num" type="number" min={1} max={9} value={form.passengers}
                         onChange={e => update('passengers', Number(e.target.value))} />
                </div>
              </div>
              <div className="field">
                <label>ملاحظات إضافية</label>
                <textarea className="textarea" placeholder="أخبرنا بأي طلبات خاصة..." value={form.notes}
                          onChange={e => update('notes', e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-primary btn-lg" onClick={next}>التالي</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="field">
                <label>الاسم الكامل</label>
                <input className="input" required value={form.customer_name}
                       onChange={e => update('customer_name', e.target.value)}
                       placeholder="أدخل اسمك الكامل" />
                {errors.customer_name && <div className="err">{errors.customer_name}</div>}
              </div>
              <div className="field">
                <label>رقم الهاتف</label>
                <input className="input num" required dir="ltr" value={form.customer_phone}
                       onChange={e => update('customer_phone', e.target.value)}
                       placeholder="9XXXXXXX" />
                {errors.customer_phone && <div className="err">{errors.customer_phone}</div>}
              </div>
              <div className="field">
                <label>البريد الإلكتروني (اختياري)</label>
                <input className="input" type="email" dir="ltr" value={form.customer_email}
                       onChange={e => update('customer_email', e.target.value)}
                       placeholder="example@email.com" />
                {errors.customer_email && <div className="err">{errors.customer_email}</div>}
              </div>
              {errors._ && <div className="err" style={{ marginBottom: 10 }}>{errors._}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={back}>رجوع</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a className="btn btn-wa" target="_blank" href={waLink(buildWa())}>
                    <Icon name="whatsapp" size={18} /> إرسال عبر واتساب
                  </a>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
                    {pending ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && submitted && (
            <div className="success-screen">
              <div className="check-circle"><Icon name="check" size={48} /></div>
              <h2 className="display">تم استلام طلبك بنجاح</h2>
              <p style={{ color: 'var(--muted)', fontSize: 16 }}>
                سيتواصل معك فريقنا خلال{' '}
                <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>15</span> دقيقة لتأكيد الحجز.
              </p>
              <div className="order-id">
                <span style={{ fontSize: 13, fontWeight: 700 }}>رقم الطلب:</span>
                <span className="num" style={{ fontWeight: 800 }}>{submitted.ref}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <a className="btn btn-wa" target="_blank" href={waLink(buildWa())}>
                  <Icon name="whatsapp" size={18} /> إرسال عبر واتساب
                </a>
                <a className="btn btn-ghost" href="/">العودة للرئيسية</a>
              </div>
            </div>
          )}
        </form>

        <aside className="booking-summary">
          <div className="card booking-summary-inner">
          {!car ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
              اختر سيارة لعرض التفاصيل
            </div>
          ) : (
            <>
              <div className="summary-img">
                <Image src={car.image_url} alt={car.name_en} fill sizes="400px"
                       style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-cairo)' }}>
                  {car.name_ar} <span className="num">{car.model}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{car.name_en}</div>
              </div>
              <div style={{ marginTop: 14 }}>
                <div className="summary-row">
                  <span style={{ color: 'var(--muted)' }}>السعر اليومي</span>
                  <span><span className="num" style={{ fontWeight: 700 }}>{car.price_per_day}</span> د.ك</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: 'var(--muted)' }}>عدد الأيام</span>
                  <span className="num">{form.days}</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: 'var(--muted)' }}>التأمين</span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>مشمول</span>
                </div>
                <div className="summary-total-card">
                  <span className="lbl">الإجمالي</span>
                  <span className="amt">
                    <span className="num">{fmtKwd(total)}</span>{' '}
                    <span style={{ fontWeight: 700 }}>د.ك</span>
                  </span>
                </div>
              </div>
              <div className="note-banner">
                <strong>ملاحظة:</strong> الأسعار شاملة التأمين. تسليم مجاني داخل الكويت العاصمة.
              </div>
            </>
          )}
          </div>
        </aside>
      </div>
    </>
  );
}
