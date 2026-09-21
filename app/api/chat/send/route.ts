import { clean, clientKey, json, needStore, readJson, sameOrigin } from '../../../lib/chat/http';
import { visitorConv } from '../../../lib/chat/auth';
import { notifyOwner } from '../../../lib/chat/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'forbidden' }, 403);
  const s = needStore();
  if ('res' in s) return s.res;
  const { store } = s;

  const body = await readJson(req);
  if (!body) return json({ ok: false, error: 'invalid' }, 400);
  const text = clean(body.text, 2000);
  if (!text) return json({ ok: false, error: 'invalid' }, 400);

  const conv = await visitorConv(store, clean(body.id, 40), clean(body.token, 100));
  if (!conv) return json({ ok: false, error: 'forbidden' }, 403);

  const ip = clientKey(req);
  if ((await store.hit(`rl:send:${conv.id}`, 600)) > 30 || (await store.hit(`rl:sendip:${ip}`, 600)) > 60) {
    return json({ ok: false, error: 'rate' }, 429);
  }

  const added = await store.addMsg(conv.id, 'visitor', text);
  if (!added) return json({ ok: false, error: 'gone' }, 404);
  await notifyOwner(store, { title: `Bericht van ${conv.name}`, body: text, url: `/inbox?c=${conv.id}`, tag: conv.id });
  return json({ ok: true, message: added.msg });
}
