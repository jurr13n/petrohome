import { clean, clientKey, EMAIL_RE, json, needStore, readJson, sameOrigin, sha256 } from '../../../lib/chat/http';
import { newId, newToken } from '../../../lib/chat/auth';
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
  // Honeypot: bots vullen dit veld in. We doen alsof het gelukt is.
  if (clean(body.website, 200)) return json({ ok: true, id: 'x', token: 'x', messages: [] });

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const text = clean(body.message, 2000);
  const locale = body.locale === 'en' ? 'en' : 'nl';
  if (!name || !EMAIL_RE.test(email) || !text) return json({ ok: false, error: 'invalid' }, 400);

  const ip = clientKey(req);
  if ((await store.hit(`rl:start:${ip}`, 3600)) > 5) return json({ ok: false, error: 'rate' }, 429);

  const token = newToken();
  const { conv, msg } = await store.createConv(
    { id: newId(), name, email, locale, createdAt: Date.now(), status: 'open', tokenHash: sha256(token) },
    text,
  );
  await notifyOwner(store, { title: `Nieuw gesprek: ${name}`, body: text, url: `/inbox?c=${conv.id}`, tag: conv.id });
  return json({ ok: true, id: conv.id, token, messages: [msg] });
}
