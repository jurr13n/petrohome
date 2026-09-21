import { NextResponse } from 'next/server';
import { checkPassword, ownerConfigured, sessionCookie } from '../../../lib/chat/auth';
import { clean, clientKey, json, needStore, readJson, sameOrigin } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!ownerConfigured()) return json({ ok: false, error: 'unavailable' }, 503);
  const s = needStore();
  if ('res' in s) return s.res;

  // Begrensd per IP, ook bij goede pogingen, zodat raden niet loont.
  if ((await s.store.hit(`rl:login:${clientKey(req)}`, 900)) > 8) return json({ ok: false, error: 'rate' }, 429);

  const body = await readJson(req);
  if (!body || !checkPassword(clean(body.password, 200))) return json({ ok: false, error: 'invalid' }, 401);

  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  res.headers.append('Set-Cookie', sessionCookie());
  return res;
}
