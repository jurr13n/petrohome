import { clean, json, needStore } from '../../../lib/chat/http';
import { visitorConv } from '../../../lib/chat/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// De token gaat in een header, niet in de URL, zodat hij niet in logs terechtkomt.
export async function GET(req: Request) {
  const s = needStore();
  if ('res' in s) return s.res;
  const { store } = s;

  const url = new URL(req.url);
  const conv = await visitorConv(store, clean(url.searchParams.get('id'), 40), clean(req.headers.get('x-chat-token'), 100));
  if (!conv) return json({ ok: false, error: 'forbidden' }, 403);
  if ((await store.hit(`rl:poll:${conv.id}`, 600)) > 250) return json({ ok: false, error: 'rate' }, 429);

  const after = Math.max(0, Number(url.searchParams.get('after')) || 0);
  const messages = await store.listMsgs(conv.id, after);
  return json({ ok: true, messages, status: conv.status });
}
