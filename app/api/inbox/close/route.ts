import { isOwner } from '../../../lib/chat/auth';
import { clean, json, needStore, readJson, sameOrigin, safe } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const body = await readJson(req);
  const id = clean(body?.id, 40);
  if (!id) return json({ ok: false, error: 'invalid' }, 400);
  await s.store.setStatus(id, body?.status === 'open' ? 'open' : 'closed');
  return json({ ok: true });
}

export const POST = (req: Request) => safe(() => handlePOST(req));
