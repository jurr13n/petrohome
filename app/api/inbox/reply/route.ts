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
  const text = clean(body?.text, 2000);
  const id = clean(body?.id, 40);
  if (!body || !text || !id) return json({ ok: false, error: 'invalid' }, 400);

  const added = await s.store.addMsg(id, 'owner', text);
  if (!added) return json({ ok: false, error: 'gone' }, 404);
  await s.store.markRead(id);
  return json({ ok: true, message: added.msg });
}

export const POST = (req: Request) => safe(() => handlePOST(req));
