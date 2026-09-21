import { Redis } from '@upstash/redis';

export type Msg = { id: number; from: 'visitor' | 'owner'; text: string; ts: number };
export type Conv = {
  id: string; name: string; email: string; locale: 'nl' | 'en';
  createdAt: number; lastAt: number; lastFrom: 'visitor' | 'owner'; lastText: string;
  unread: number; seq: number; status: 'open' | 'closed'; tokenHash: string;
};
export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

export interface Store {
  createConv(conv: Omit<Conv, 'seq' | 'unread' | 'lastAt' | 'lastFrom' | 'lastText'>, first: string): Promise<{ conv: Conv; msg: Msg }>;
  getConv(id: string): Promise<Conv | null>;
  addMsg(id: string, from: Msg['from'], text: string): Promise<{ conv: Conv; msg: Msg } | null>;
  listMsgs(id: string, afterSeq?: number): Promise<Msg[]>;
  listConvs(limit: number): Promise<Conv[]>;
  markRead(id: string): Promise<void>;
  setStatus(id: string, status: Conv['status']): Promise<void>;
  savePush(sub: PushSub): Promise<void>;
  removePush(endpoint: string): Promise<void>;
  listPush(): Promise<PushSub[]>;
  hit(key: string, ttlSec: number): Promise<number>;
}

const TTL = 60 * 60 * 24 * 90;
const MAX_MSGS = 200;

// ---- Redis (productie) ----
function redisStore(redis: Redis): Store {
  const ck = (id: string) => `chat:conv:${id}`;
  const mk = (id: string) => `chat:msgs:${id}`;
  const toConv = (h: Record<string, string> | null): Conv | null => {
    if (!h || !h.id) return null;
    return {
      id: h.id, name: h.name, email: h.email, locale: h.locale === 'en' ? 'en' : 'nl',
      createdAt: Number(h.createdAt), lastAt: Number(h.lastAt), lastFrom: h.lastFrom === 'owner' ? 'owner' : 'visitor',
      lastText: h.lastText ?? '', unread: Number(h.unread || 0), seq: Number(h.seq || 0),
      status: h.status === 'closed' ? 'closed' : 'open', tokenHash: h.tokenHash,
    };
  };
  const store: Store = {
    async createConv(base, first) {
      const now = Date.now();
      const conv: Conv = { ...base, lastAt: now, lastFrom: 'visitor', lastText: first.slice(0, 140), unread: 1, seq: 1 };
      const msg: Msg = { id: 1, from: 'visitor', text: first, ts: now };
      const p = redis.pipeline();
      p.hset(ck(conv.id), Object.fromEntries(Object.entries(conv).map(([k, v]) => [k, String(v)])));
      p.expire(ck(conv.id), TTL);
      p.rpush(mk(conv.id), JSON.stringify(msg));
      p.expire(mk(conv.id), TTL);
      p.zadd('chat:index', { score: now, member: conv.id });
      await p.exec();
      return { conv, msg };
    },
    async getConv(id) { return toConv(await redis.hgetall<Record<string, string>>(ck(id))); },
    async addMsg(id, from, text) {
      const cur = await store.getConv(id);
      if (!cur) return null;
      const now = Date.now();
      const seq = await redis.hincrby(ck(id), 'seq', 1);
      const msg: Msg = { id: seq, from, text, ts: now };
      const p = redis.pipeline();
      p.rpush(mk(id), JSON.stringify(msg));
      p.ltrim(mk(id), -MAX_MSGS, -1);
      p.expire(mk(id), TTL);
      p.hset(ck(id), { lastAt: String(now), lastFrom: from, lastText: text.slice(0, 140), status: 'open' });
      if (from === 'visitor') p.hincrby(ck(id), 'unread', 1);
      p.expire(ck(id), TTL);
      p.zadd('chat:index', { score: now, member: id });
      await p.exec();
      const conv = (await store.getConv(id)) as Conv;
      return { conv, msg };
    },
    async listMsgs(id, afterSeq = 0) {
      const raw = await redis.lrange<string>(mk(id), 0, -1);
      return raw.map((r) => JSON.parse(r) as Msg).filter((m) => m.id > afterSeq);
    },
    async listConvs(limit) {
      await redis.zremrangebyscore('chat:index', 0, Date.now() - TTL * 1000); // verlopen gesprekken uit de index
      const ids = await redis.zrange<string[]>('chat:index', 0, limit - 1, { rev: true });
      if (!ids.length) return [];
      const p = redis.pipeline();
      ids.forEach((i) => p.hgetall(ck(i)));
      const rows = (await p.exec()) as Array<Record<string, string> | null>;
      return rows.map(toConv).filter((c): c is Conv => !!c);
    },
    async markRead(id) { await redis.hset(ck(id), { unread: '0' }); },
    async setStatus(id, status) { await redis.hset(ck(id), { status }); },
    async savePush(sub) { await redis.hset('chat:push', { [sub.endpoint]: JSON.stringify(sub) }); },
    async removePush(endpoint) { await redis.hdel('chat:push', endpoint); },
    async listPush() {
      const all = await redis.hgetall<Record<string, string>>('chat:push');
      return all ? Object.values(all).map((v) => JSON.parse(v) as PushSub) : [];
    },
    async hit(key, ttlSec) {
      const n = await redis.incr(key);
      if (n === 1) await redis.expire(key, ttlSec);
      return n;
    },
  };
  return store;
}

// ---- Geheugen (alleen lokaal) ----
type Mem = { convs: Map<string, Conv>; msgs: Map<string, Msg[]>; push: Map<string, PushSub>; hits: Map<string, { n: number; exp: number }> };
function memoryStore(): Store {
  const g = globalThis as unknown as { __chatMem?: Mem };
  const mem: Mem = (g.__chatMem ??= { convs: new Map(), msgs: new Map(), push: new Map(), hits: new Map() });
  return {
    async createConv(base, first) {
      const now = Date.now();
      const conv: Conv = { ...base, lastAt: now, lastFrom: 'visitor', lastText: first.slice(0, 140), unread: 1, seq: 1 };
      const msg: Msg = { id: 1, from: 'visitor', text: first, ts: now };
      mem.convs.set(conv.id, conv); mem.msgs.set(conv.id, [msg]);
      return { conv: { ...conv }, msg };
    },
    async getConv(id) { const c = mem.convs.get(id); return c ? { ...c } : null; },
    async addMsg(id, from, text) {
      const c = mem.convs.get(id); if (!c) return null;
      const now = Date.now(); c.seq += 1;
      const msg: Msg = { id: c.seq, from, text, ts: now };
      const list = mem.msgs.get(id)!; list.push(msg); if (list.length > MAX_MSGS) list.shift();
      Object.assign(c, { lastAt: now, lastFrom: from, lastText: text.slice(0, 140), status: 'open' as const });
      if (from === 'visitor') c.unread += 1;
      return { conv: { ...c }, msg };
    },
    async listMsgs(id, afterSeq = 0) { return (mem.msgs.get(id) ?? []).filter((m) => m.id > afterSeq); },
    async listConvs(limit) { return [...mem.convs.values()].sort((a, b) => b.lastAt - a.lastAt).slice(0, limit).map((c) => ({ ...c })); },
    async markRead(id) { const c = mem.convs.get(id); if (c) c.unread = 0; },
    async setStatus(id, status) { const c = mem.convs.get(id); if (c) c.status = status; },
    async savePush(sub) { mem.push.set(sub.endpoint, sub); },
    async removePush(endpoint) { mem.push.delete(endpoint); },
    async listPush() { return [...mem.push.values()]; },
    async hit(key, ttlSec) {
      const now = Date.now(); const cur = mem.hits.get(key);
      if (!cur || cur.exp < now) { mem.hits.set(key, { n: 1, exp: now + ttlSec * 1000 }); return 1; }
      cur.n += 1; return cur.n;
    },
  };
}

// Redis uit Vercel Marketplace (Upstash) of KV-namen; lokaal (development) geheugen.
export function chatEnabled(): boolean {
  return !!redisEnv() || process.env.NODE_ENV !== 'production';
}
function redisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}
let cached: Store | null = null;
export function getStore(): Store | null {
  if (cached) return cached;
  const env = redisEnv();
  if (env) cached = redisStore(new Redis({ ...env, automaticDeserialization: false }));
  else if (process.env.NODE_ENV !== 'production') cached = memoryStore();
  return cached;
}
