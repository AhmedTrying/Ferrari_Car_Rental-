'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    initialError === 'forbidden' ? 'هذا الحساب لا يملك صلاحيات الإدارة.' : null
  );
  const [pending, startTransition] = useTransition();

  const supabase = createClient();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr || !data.session) {
        setError('البريد أو كلمة المرور غير صحيحة.');
        return;
      }
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (!isAdmin) {
        await supabase.auth.signOut();
        setError('هذا الحساب لا يملك صلاحيات الإدارة.');
        return;
      }
      router.replace(next || '/admin');
      router.refresh();
    });
  }

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h2 style={{ fontFamily: 'var(--font-cairo)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
        مرحباً بعودتك
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: 28 }}>سجّل الدخول للمتابعة إلى لوحة التحكم.</p>
      <div className="field">
        <label>البريد الإلكتروني</label>
        <input className="input" type="email" dir="ltr" required
               value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>كلمة المرور</label>
        <input className="input" type="password" required
               value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, fontSize: 13,
      }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked /> تذكرني
        </label>
        <a href="#" style={{ color: 'var(--ink)' }}>نسيت كلمة المرور؟</a>
      </div>
      <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={pending}>
        {pending ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
        <a href="/" style={{ color: 'var(--muted)' }}>← العودة للموقع الرئيسي</a>
      </div>
    </form>
  );
}
