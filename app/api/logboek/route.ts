import { isOwner } from '../../lib/chat/auth';
import { json, readJson, safe, sameOrigin } from '../../lib/chat/http';
import { getLogboek, MAX_GESPREKKEN, newGesprekId, sanitize, validId, type LogboekStore } from '../../lib/logboek';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function guard(req: Request, write: boolean): { res: Response } | { store: LogboekStore } {
  if (!isOwner(req)) return { res: json({ ok: false, error: 'unauthorized' }, 401) };
  if (write && !sameOrigin(req)) return { res: json({ ok: false, error: 'forbidden' }, 403) };
  const store = getLogboek();
  if (!store) return { res: json({ ok: false, error: 'unavailable' }, 503) };
  return { store };
}

async function handleGET(req: Request) {
  const g = guard(req, false);
  if ('res' in g) return g.res;
  return json({ ok: true, gesprekken: await g.store.list() });
}

async function handlePOST(req: Request) {
  const g = guard(req, true);
  if ('res' in g) return g.res;
  const body = await readJson(req);
  if (!body || typeof body.data !== 'object' || !body.data) return json({ ok: false, error: 'invalid' }, 400);
  const bestaand = body.id !== undefined && body.id !== null;
  if (bestaand && !validId(body.id)) return json({ ok: false, error: 'invalid' }, 400);
  if (bestaand && !(await g.store.exists(body.id as string))) return json({ ok: false, error: 'not_found' }, 404);
  if (!bestaand && (await g.store.count()) >= MAX_GESPREKKEN) return json({ ok: false, error: 'full' }, 409);
  const id = bestaand ? (body.id as string) : newGesprekId();
  const gesprek = sanitize(body.data as Record<string, unknown>, id);
  if (!gesprek) return json({ ok: false, error: 'invalid' }, 400);
  await g.store.put(gesprek);
  return json({ ok: true, id });
}

async function handleDELETE(req: Request) {
  const g = guard(req, true);
  if ('res' in g) return g.res;
  const body = await readJson(req);
  if (!body || !validId(body.id)) return json({ ok: false, error: 'invalid' }, 400);
  await g.store.remove(body.id);
  return json({ ok: true });
}

export const GET = (req: Request) => safe(() => handleGET(req));
export const POST = (req: Request) => safe(() => handlePOST(req));
export const DELETE = (req: Request) => safe(() => handleDELETE(req));
