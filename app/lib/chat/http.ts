import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getStore, type Store } from './store';

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Trimt, verwijdert besturingstekens (behalve nieuwe regel) en kapt af. */
export function clean(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim().slice(0, max);
}
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Leest een JSON-body, alleen als het echt JSON is en niet te groot. */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get('content-type') || '').includes('application/json')) return null;
  const text = await req.text();
  if (text.length > 20_000) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Alleen verzoeken vanaf onze eigen site (browsers sturen Origin mee bij POST). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientKey(req: Request): string {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Store, of een nette 503 als de chat (nog) niet is ingericht. */
export function needStore(): { store: Store } | { res: NextResponse } {
  const store = getStore();
  return store ? { store } : { res: json({ ok: false, error: 'unavailable' }, 503) };
}
