import { isOwner } from '../../../lib/chat/auth';
import { json, needStore, safe } from '../../../lib/chat/http';
import { pushConfigured } from '../../../lib/chat/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGET(req: Request) {
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const convs = await s.store.listConvs(100);
  // De tokenhash gaat nooit naar de client.
  return json({
    ok: true,
    push: pushConfigured(),
    conversations: convs.map(({ tokenHash: _t, ...c }) => c),
  });
}

export const GET = (req: Request) => safe(() => handleGET(req));
