'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';

type Locale = 'nl' | 'en';

// Posities in procenten van de screenshot (1655 × 1275).
const SPOTS = [
  { x: 53, y: 39.7, nl: ['Verlof met bezetting in beeld', 'Ruud Brouwer heeft verlof op donderdag 17 september. Onderaan zie je meteen wat dat met de bezetting doet: het overschot van +1 zakt naar +0.'], en: ['Leave with staffing in view', 'Ruud Brouwer is on leave on Thursday 17 September. The bottom rows show right away what that does to staffing: the surplus of +1 drops to +0.'] },
  { x: 56.4, y: 92.2, nl: ['Tekorten in één oogopslag', 'Onderaan staat per dag het verschil met de minimumbezetting. Groen is voldoende, rood is te weinig mensen.'], en: ['Shortages at a glance', 'The bottom row shows the difference from minimum staffing per day. Green is covered, red is too few people.'] },
  { x: 59.8, y: 30.1, nl: ['Opkomstdagen en invallers', 'Op maandag 21 september komt Mark de Jong op als opkomer (opk). Opkomers hebben een eigen regel in dezelfde matrix.'], en: ['On-call days and cover', 'On Monday 21 September Mark de Jong covers as on-call (opk). Cover staff get their own row in the same matrix.'] },
  { x: 77.2, y: 36.4, nl: ['Saldo, verlof en overwerk', 'De uren per medewerker staan naast het rooster, dus geen los lijstje ernaast.'], en: ['Balance, leave and overtime', 'Hours per employee sit next to the roster, so there is no separate list to keep.'] },
] as const;

const COPY = {
  nl: { hint: 'Tik op de stippen voor uitleg.', open: 'Bekijk op volledig formaat', spot: (n: number) => `Uitleg ${n} van ${SPOTS.length}`, alt: 'PetroShift-rooster: maandmatrix september 2026 met medewerkers, ochtend-, middag- en nachtdiensten, verlof, bezetting en tekorten.' },
  en: { hint: 'Tap the dots for details.', open: 'View full size', spot: (n: number) => `Detail ${n} of ${SPOTS.length}`, alt: 'PetroShift roster: monthly matrix for September 2026 with employees, morning, afternoon and night shifts, leave, staffing and shortages.' },
} as const;

export default function RoosterPreview({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [active, setActive] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => { if (!canvas.current?.contains(e.target as Node)) setActive(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [active]);

  const spot = active === null ? null : SPOTS[active];
  const pos = (s: (typeof SPOTS)[number]) => ({ '--x': `${s.x}%`, '--y': `${s.y}%` }) as CSSProperties;

  return (
    <div className="actual-app-preview">
      <div className="preview-canvas" ref={canvas}>
        <img src="/petroshift-rooster.png" alt={t.alt} width="2400" height="1452" />
        {SPOTS.map((s, i) => (
          <button key={i} type="button" className={`hotspot${touched ? '' : ' hint'}${active === i ? ' on' : ''}`} style={pos(s)} aria-label={t.spot(i + 1)} aria-expanded={active === i} onClick={() => { setTouched(true); setActive(active === i ? null : i); }}>
            <span className="hotspot-dot" />
          </button>
        ))}
        {spot && (
          <div key={active} className={`hotspot-card ${spot.y > 60 ? 'up' : 'down'}`} style={pos(spot)} role="status">
            <strong>{spot[locale][0]}</strong>
            <p>{spot[locale][1]}</p>
          </div>
        )}
      </div>
      <p className="preview-hint">{t.hint}</p>
      <a className="preview-open" href="/petroshift-rooster.png" target="_blank" rel="noopener noreferrer">{t.open} <ArrowUpRight size={16} /></a>
    </div>
  );
}
