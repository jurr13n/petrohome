import { isOwner } from '../../../lib/chat/auth';
import { clean, json, needStore, readJson, sameOrigin } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseSub(body: Record<string, unknown> | null) {
  const sub = body?.subscription as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | undefined;
  const endpoint = clean(sub?.endpoint, 1000);
  const p256dh = clean(sub?.keys?.p256dh, 200);
  const auth = clean(sub?.keys?.auth, 100);
  // Alleen https-eindpunten van push-diensten; nooit een willekeurige URL laten aanroepen.
  return endpoint.startsWith('https://') && p256dh && auth ? { endpoint, keys: { p256dh, auth } } : null;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const sub = parseSub(await readJson(req));
  if (!sub) return json({ ok: false, error: 'invalid' }, 400);
  await s.store.savePush(sub);
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const body = await readJson(req);
  const endpoint = clean(body?.endpoint, 1000);
  if (endpoint) await s.store.removePush(endpoint);
  return json({ ok: true });
}
