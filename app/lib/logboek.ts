import { Redis } from '@upstash/redis';
import { randomBytes } from 'node:crypto';
import { clean } from './chat/http';

// Gesprekslogboek voor de salesgesprekken (fase 1). Alleen de eigenaar leest en
// schrijft, via de inbox-sessie. Alle gesprekken staan in één Redis-hash.
const KEY = 'logboek:gesprekken';
const MAX = 500;

export type Gesprek = Record<string, string | number | boolean | number[] | null> & { id: string };

export interface LogboekStore {
  list(): Promise<Gesprek[]>;
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
  put(g: Gesprek): Promise<void>;
  remove(id: string): Promise<void>;
}

function toObj(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const o: Record<string, string> = {};
    for (let i = 0; i + 1 < raw.length; i += 2) o[String(raw[i])] = String(raw[i + 1]);
    return o;
  }
  return typeof raw === 'object' ? (raw as Record<string, string>) : {};
}
const parse = (s: string): Gesprek | null => {
  try { const v = JSON.parse(s); return v && typeof v === 'object' && typeof v.id === 'string' ? v : null; } catch { return null; }
};

function redisStore(redis: Redis): LogboekStore {
  return {
    async list() { return Object.values(toObj(await redis.hgetall(KEY))).map(parse).filter((g): g is Gesprek => !!g); },
    async count() { return Number(await redis.hlen(KEY)); },
    async exists(id) { return Number(await redis.hexists(KEY, id)) === 1; },
    async put(g) { await redis.hset(KEY, { [g.id]: JSON.stringify(g) }); },
    async remove(id) { await redis.hdel(KEY, id); },
  };
}
function memoryStore(): LogboekStore {
  const m = new Map<string, Gesprek>();
  return {
    async list() { return [...m.values()]; },
    async count() { return m.size; },
    async exists(id) { return m.has(id); },
    async put(g) { m.set(g.id, g); },
    async remove(id) { m.delete(id); },
  };
}

let cached: LogboekStore | null = null;
export function getLogboek(): LogboekStore | null {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) cached = redisStore(new Redis({ url, token, automaticDeserialization: false }));
  else if (process.env.NODE_ENV !== 'production') cached = memoryStore();
  return cached;
}
export const MAX_GESPREKKEN = MAX;

export const newGesprekId = () => randomBytes(9).toString('base64url');
export const validId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{6,40}$/.test(id);

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TEXT: Record<string, number> = {
  bedrijf: 120, rol: 60, naam: 120, kanaal: 60, verhaal: 4000, pijn: 4000,
  beslisser: 300, budget: 300, stap: 300, notities: 4000,
};
const ENUMS: Record<string, string[]> = {
  prijs: ['', 'laag', 'voorleggen', 'duur', 'vergelijk'],
  pakket: ['', 'Rooster', 'Ploegendienst', 'Site'],
  uitkomst: ['open', 'proef', 'intro', 'vervolg', 'info', 'geen'],
};
const num = (v: unknown, max: number) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v.replace(',', '.')) : NaN;
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 10) / 10 : null;
};
const ints = (v: unknown) => (Array.isArray(v) ? [...new Set(v.filter((x) => Number.isInteger(x) && x >= 0 && x < 20))].slice(0, 20) as number[] : []);

/** Neemt alleen bekende velden over, met grenzen; al het andere valt weg. */
export function sanitize(input: Record<string, unknown>, id: string): Gesprek | null {
  const datum = typeof input.datum === 'string' && DATE.test(input.datum) ? input.datum : '';
  if (!datum) return null;
  const g: Gesprek = { id, datum };
  for (const [k, max] of Object.entries(TEXT)) g[k] = clean(input[k], max);
  for (const [k, allowed] of Object.entries(ENUMS)) {
    const v = typeof input[k] === 'string' ? (input[k] as string) : '';
    g[k] = allowed.includes(v) ? v : allowed[0];
  }
  g.stapdatum = typeof input.stapdatum === 'string' && DATE.test(input.stapdatum) ? input.stapdatum : '';
  g.uren = num(input.uren, 200);
  g.mw = num(input.mw, 100000);
  g.demo = input.demo === true;
  g.werkwijze = ints(input.werkwijze);
  g.goed = ints(input.goed);
  g.slecht = ints(input.slecht);
  g.gewijzigd = new Date().toISOString();
  return g;
}
