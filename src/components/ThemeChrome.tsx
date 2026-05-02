'use client';
import { Icon } from './icons';
import { SITE } from '@/lib/constants';

export default function ThemeChrome({ showWhatsapp = true }: { showWhatsapp?: boolean }) {
  return (
    <>
      {showWhatsapp && (
        <a className="wa-fab" href={`https://wa.me/${SITE.whatsapp}`} target="_blank"
           aria-label="تواصل عبر واتساب">
          <Icon name="whatsapp" size={28} />
        </a>
      )}
    </>
  );
}
