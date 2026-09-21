import { isOwner } from '../../../../lib/chat/auth';
import { json, needStore, sameOrigin, safe } from '../../../../lib/chat/http';
import { notifyOwner } from '../../../../lib/chat/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handlePOST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const sent = await notifyOwner(s.store, { title: 'PetroShift Inbox', body: 'Testmelding: pushmeldingen werken.', url: '/inbox', tag: 'test' });
  return json({ ok: true, sent });
}

export const POST = (req: Request) => safe(() => handlePOST(req));
