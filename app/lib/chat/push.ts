import webpush from 'web-push';
import type { Store } from './store';

let ready = false;
function init(): boolean {
  if (ready) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:info@petroshift.nl', pub, priv);
  ready = true;
  return true;
}
export const pushConfigured = () => !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

/** Stuurt een melding naar alle apparaten van de eigenaar. Fouten blokkeren het bericht nooit. */
export async function notifyOwner(store: Store, n: { title: string; body: string; url: string; tag: string }): Promise<number> {
  try {
    return await send(store, n);
  } catch (err) {
    console.error('push-fout', (err as Error)?.message);
    return 0;
  }
}

async function send(store: Store, n: { title: string; body: string; url: string; tag: string }): Promise<number> {
  if (!init()) return 0;
  const subs = await store.listPush();
  const payload = JSON.stringify({ ...n, body: n.body.slice(0, 140) });
  let sent = 0;
  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s, payload, { TTL: 60 * 60 * 24 });
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await store.removePush(s.endpoint);
        else console.error('push-fout', status);
      }
    }),
  );
  return sent;
}

/** Voor de testknop in de inbox: laat per stap zien wat er misgaat (alleen voor de ingelogde eigenaar). */
export async function diagnose(store: Store, n: { title: string; body: string; url: string; tag: string }) {
  const info = { configured: pushConfigured(), subs: 0, sent: 0, errors: [] as string[] };
  try {
    if (!init()) return info;
  } catch (err) {
    info.errors.push(`VAPID: ${(err as Error).message}`);
    return info;
  }
  const subs = await store.listPush();
  info.subs = subs.length;
  const payload = JSON.stringify(n);
  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(s, payload, { TTL: 300 });
        info.sent += 1;
      } catch (err) {
        const e = err as { statusCode?: number; body?: string; message?: string };
        info.errors.push(`${new URL(s.endpoint).host}: ${e.statusCode ?? ''} ${String(e.body || e.message || '').slice(0, 140)}`.trim());
        if (e.statusCode === 404 || e.statusCode === 410) await store.removePush(s.endpoint);
      }
    }),
  );
  return info;
}
