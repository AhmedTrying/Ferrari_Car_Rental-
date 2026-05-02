'use client';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function RevenueChart({ data }: { data: { ym: string; revenue: number }[] }) {
  if (!data.length) return <div className="chart-grid-empty">لا توجد بيانات للعرض بعد.</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
        <XAxis dataKey="ym" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false}
               width={40} />
        <Tooltip
          formatter={(v: number) => [`${v} د.ك`, 'الإيرادات']}
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12 }}
        />
        <Bar dataKey="revenue" fill="var(--y)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
