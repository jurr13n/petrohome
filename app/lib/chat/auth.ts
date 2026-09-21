import { createHmac, randomBytes } from 'node:crypto';
import { safeEqual, sha256 } from './http';
import type { Conv, Store } from './store';

const COOKIE = 'inbox_session';
const MAX_AGE = 60 * 60 * 24 * 30;

const secret = () => process.env.CHAT_SESSION_SECRET || '';
const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export const ownerConfigured = () => !!process.env.CHAT_ADMIN_PASSWORD && secret().length >= 16;

export function checkPassword(pw: string): boolean {
  const expected = process.env.CHAT_ADMIN_PASSWORD || '';
  return !!expected && safeEqual(pw, expected);
}

export function sessionCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${exp}.${sign(String(exp))}`;
  return `${COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;

export function isOwner(req: Request): boolean {
  if (!ownerConfigured()) return false;
  const header = req.headers.get('cookie') || '';
  const raw = header.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, mac] = raw.slice(COOKIE.length + 1).split('.');
  if (!exp || !mac || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(mac, sign(exp));
}

export const newToken = () => randomBytes(24).toString('hex');
export const newId = () => randomBytes(9).toString('base64url');

/** De bezoeker bewijst met zijn geheime token dat het zijn gesprek is. */
export async function visitorConv(store: Store, id: string, token: string): Promise<Conv | null> {
  if (!id || !token || id.length > 40 || token.length > 100) return null;
  const conv = await store.getConv(id);
  return conv && safeEqual(sha256(token), conv.tokenHash) ? conv : null;
}
