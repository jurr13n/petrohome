import { NextResponse } from 'next/server';
import { clean, clientKey, EMAIL_RE, readJson, sameOrigin } from '../../lib/chat/http';
import { getStore } from '../../lib/chat/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Tegen spam: per IP en voor de hele site per uur begrensd, zodat een script
// de mailbox niet kan laten vollopen of het Resend-tegoed opmaken.
const PER_IP_PER_UUR = 5;
const TOTAAL_PER_UUR = 40;

const COPY = {
  nl: {
    validation: 'Naam en een geldig e-mailadres zijn verplicht',
    notConfigured: 'E-mail is nog niet geconfigureerd',
    sendFailed: 'Versturen is mislukt',
    rate: 'Te veel aanvragen. Probeer het later opnieuw of mail naar info@petroshift.nl',
    subject: (bedrijf: string) => `Aanvraag via website${bedrijf ? ' – ' + bedrijf : ''}`,
    labels: { naam: 'Naam', bedrijf: 'Bedrijf', email: 'E-mail', telefoon: 'Telefoon' },
  },
  en: {
    validation: 'Name and a valid email address are required',
    notConfigured: 'Email is not configured yet',
    sendFailed: 'Sending failed',
    rate: 'Too many requests. Please try again later or email info@petroshift.nl',
    subject: (bedrijf: string) => `Website inquiry${bedrijf ? ' – ' + bedrijf : ''}`,
    labels: { naam: 'Name', bedrijf: 'Company', email: 'Email', telefoon: 'Phone' },
  },
} as const;

export async function POST(req: Request) {
  // Alleen vanaf onze eigen site; readJson weigert ook te grote of niet-JSON-bodies.
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'Ongeldig verzoek / Invalid request' }, { status: 403 });
  }
  const body = await readJson(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: 'Ongeldig verzoek / Invalid request' }, { status: 400 });
  }

  const locale = body.locale === 'en' ? 'en' : 'nl';
  const t = COPY[locale];

  // Honeypot: onzichtbaar voor mensen (aria-hidden, off-screen), bots vullen het vaak toch in.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const naam = clean(body.naam, 120);
  const bedrijf = clean(body.bedrijf, 120);
  const email = clean(body.email, 200);
  const telefoon = clean(body.telefoon, 40);
  const bericht = clean(body.bericht, 2000);

  if (!naam || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: t.validation }, { status: 400 });
  }

  // Zonder opslag (lokaal zonder Redis) geen limiet; in productie is Redis er altijd.
  const store = getStore();
  if (store) {
    const perIp = await store.hit(`rl:aanvraag:${clientKey(req)}`, 3600);
    const totaal = await store.hit('rl:aanvraag:totaal', 3600);
    if (perIp > PER_IP_PER_UUR || totaal > TOTAAL_PER_UUR) {
      return NextResponse.json({ ok: false, error: t.rate }, { status: 429 });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY ontbreekt — aanvraag kon niet verstuurd worden');
    return NextResponse.json({ ok: false, error: t.notConfigured }, { status: 500 });
  }

  const to = process.env.CONTACT_EMAIL || 'info@petroshift.nl';
  const from = process.env.RESEND_FROM || 'PetroShift <onboarding@resend.dev>';
  const subject = t.subject(bedrijf);
  const text = [
    `${t.labels.naam}: ${naam}`,
    bedrijf && `${t.labels.bedrijf}: ${bedrijf}`,
    `${t.labels.email}: ${email}`,
    telefoon && `${t.labels.telefoon}: ${telefoon}`,
    '',
    bericht,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: [email], subject, text }),
    });
    if (!res.ok) {
      console.error('Resend-fout', res.status, await res.text().catch(() => ''));
      return NextResponse.json({ ok: false, error: t.sendFailed }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Resend-fout', err);
    return NextResponse.json({ ok: false, error: t.sendFailed }, { status: 502 });
  }
}
