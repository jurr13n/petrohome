import { isOwner } from '../../../../lib/chat/auth';
import { clean, json, needStore } from '../../../../lib/chat/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isOwner(req)) return json({ ok: false, error: 'unauthorized' }, 401);
  const s = needStore();
  if ('res' in s) return s.res;
  const { id } = await ctx.params;
  const conv = await s.store.getConv(clean(id, 40));
  if (!conv) return json({ ok: false, error: 'gone' }, 404);
  const after = Math.max(0, Number(new URL(req.url).searchParams.get('after')) || 0);
  const messages = await s.store.listMsgs(conv.id, after);
  const { tokenHash: _t, ...safe } = conv;
  return json({ ok: true, conversation: safe, messages });
}
