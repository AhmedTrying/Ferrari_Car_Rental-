import Link from 'next/link';
import Image from 'next/image';
import { Icon } from './icons';
import { CAR_TYPES, FEATURE_LABELS, SITE } from '@/lib/constants';
import { waLink } from '@/lib/utils';
import type { Car } from '@/lib/supabase/database.types';

export default function CarCard({ car }: { car: Car }) {
  const typeLabel = CAR_TYPES.find(t => t.id === car.type)?.label ?? '';
  const featureList: string[] = Array.isArray(car.features) ? (car.features as string[]) : [];
  const features = (featureList.length ? featureList : ['driver', 'insurance', 'mileage', 'no-deposit']).slice(0, 4);

  return (
    <article className="car-card">
      <div className="car-img">
        <Image src={car.image_url} alt={car.name_en} fill sizes="(max-width:700px) 100vw, 33vw" />
      </div>
      <div className="car-badge"><span className="yellow-tag">{typeLabel}</span></div>
      <div className="car-body">
        <div className="car-title">
          <div>
            <h3>{car.name_ar} <span className="num">{car.model}</span></h3>
            <div className="sub">{car.name_en} · <span className="num">{car.year}</span></div>
          </div>
        </div>
        <div className="feature-row">
          {features.map((f: string) => {
            const meta = FEATURE_LABELS[f] ?? { label: f, icon: 'sparkle' };
            return (
              <span key={f} className="feature-pill">
                <span className="ic"><Icon name={meta.icon} size={14} /></span>{meta.label}
              </span>
            );
          })}
        </div>
        <div className="car-foot">
          <div className="price">
            <span className="v num">{car.price_per_day}</span>
            <span className="c">د.ك</span><span className="s">/ يومياً</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <a className="btn btn-wa btn-sm" target="_blank"
               href={waLink(`أرغب بحجز ${car.name_ar} ${car.model}`)} aria-label="WhatsApp">
              <Icon name="whatsapp" size={16} />
            </a>
            <Link className="btn btn-primary btn-sm" href={`/booking?car=${car.slug}`}>
              احجز <Icon name="arrowL" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
