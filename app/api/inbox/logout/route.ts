import { NextResponse } from 'next/server';
import { clearCookie } from '../../../lib/chat/auth';
import { json, sameOrigin, safe } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  res.headers.append('Set-Cookie', clearCookie());
  return res;
}

export const POST = (req: Request) => safe(() => handlePOST(req));
