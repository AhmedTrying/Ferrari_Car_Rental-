'use client';
import { useState } from 'react';
import CarCard from './CarCard';
import { CAR_TYPES } from '@/lib/constants';
import type { Car, CarType } from '@/lib/supabase/database.types';

export default function CarFilters({ cars, limit }: { cars: Car[]; limit?: number }) {
  const [active, setActive] = useState<CarType | 'all'>('all');
  const filtered = active === 'all' ? cars : cars.filter(c => c.type === active);
  const list = limit ? filtered.slice(0, limit) : filtered;

  return (
    <>
      <div className="filters-bar" style={{ marginBottom: 28 }}>
        {CAR_TYPES.map(t => (
          <button key={t.id} className={`chip ${t.id === active ? 'active' : ''}`}
                  onClick={() => setActive(t.id as CarType | 'all')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="cars-grid">
        {list.map(c => <CarCard key={c.id} car={c} />)}
      </div>
      {list.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          لا توجد سيارات في هذه الفئة حالياً.
        </div>
      )}
    </>
  );
}
