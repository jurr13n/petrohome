import { isOwner } from '../../../lib/chat/auth';
import { clean, json, needStore, readJson, sameOrigin } from '../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const id = clean((await readJson(req))?.id, 40);
  if (!id) return json({ ok: false, error: 'invalid' }, 400);
  await s.store.markRead(id);
  return json({ ok: true });
}
