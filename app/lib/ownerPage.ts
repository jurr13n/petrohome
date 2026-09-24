import { isOwner } from './chat/auth';

// Interne pagina's (logboek, gespreksmap) staan achter de inbox-sessie:
// zonder login alleen een verwijzing naar de inbox, nooit de inhoud.
const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'same-origin',
};

const login = (title: string) => `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${title} | PetroShift</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui,sans-serif;background:#F5F8FA;color:#0B1B2B;padding:16px}main{max-width:380px;display:grid;gap:12px}a{display:inline-block;background:#0A86BC;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600;justify-self:start}</style></head>
<body><main><h1 style="margin:0;font-size:22px">Log eerst in</h1><p style="margin:0;color:#51616F">Deze pagina gebruikt dezelfde login als je inbox. Log daar in en kom dan terug.</p><a href="/inbox">Naar de inbox</a></main></body></html>`;

export function ownerPage(req: Request, html: string, title: string): Response {
  const ok = isOwner(req);
  return new Response(ok ? html : login(title), { status: ok ? 200 : 401, headers });
}
