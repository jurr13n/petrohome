import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Ongeldig verzoek' }, { status: 400 });
  }

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
    return NextResponse.json({ ok: false, error: 'Naam en een geldig e-mailadres zijn verplicht' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY ontbreekt — aanvraag kon niet verstuurd worden');
    return NextResponse.json({ ok: false, error: 'E-mail is nog niet geconfigureerd' }, { status: 500 });
  }

  const to = process.env.CONTACT_EMAIL || 'info@petroshift.nl';
  const from = process.env.RESEND_FROM || 'PetroShift <onboarding@resend.dev>';
  const subject = `Aanvraag via website${bedrijf ? ' – ' + bedrijf : ''}`;
  const text = [
    `Naam: ${naam}`,
    bedrijf && `Bedrijf: ${bedrijf}`,
    `E-mail: ${email}`,
    telefoon && `Telefoon: ${telefoon}`,
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
      return NextResponse.json({ ok: false, error: 'Versturen is mislukt' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Resend-fout', err);
    return NextResponse.json({ ok: false, error: 'Versturen is mislukt' }, { status: 502 });
  }
}
