'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';

type Locale = 'nl' | 'en';
type Values = { naam: string; bedrijf: string; email: string; telefoon: string; bericht: string; website: string };
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY: Values = { naam: '', bedrijf: '', email: '', telefoon: '', bericht: '', website: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  nl: {
    label: 'Aanvraagformulier', title: 'Vraag vrijblijvend informatie aan', hint: 'We nemen zo snel mogelijk contact op.',
    naam: 'Naam*', bedrijf: 'Bedrijf', email: 'E-mail*', telefoon: 'Telefoonnummer', bericht: 'Bericht',
    berichtPh: 'Vertel kort over je ploegen en waar je hulp bij zoekt.',
    naamErr: 'Vul je naam in.', emailErr: 'Vul een geldig e-mailadres in.',
    send: 'Verstuur aanvraag', sending: 'Bezig met versturen…',
    sentTitle: 'Aanvraag verstuurd', sentText: 'Bedankt, we nemen zo snel mogelijk contact op.',
    error: 'Dat ging niet goed. Bel of mail ons direct:', or: 'of',
  },
  en: {
    label: 'Contact form', title: 'Request information, no strings attached', hint: 'We’ll get back to you as soon as possible.',
    naam: 'Name*', bedrijf: 'Company', email: 'Email*', telefoon: 'Phone number', bericht: 'Message',
    berichtPh: 'Tell us briefly about your teams and what you need help with.',
    naamErr: 'Please enter your name.', emailErr: 'Please enter a valid email address.',
    send: 'Send request', sending: 'Sending…',
    sentTitle: 'Request sent', sentText: 'Thanks, we’ll be in touch as soon as possible.',
    error: 'Something went wrong. Call or email us directly:', or: 'or',
  },
} as const;

export default function AanvraagForm({ locale, phoneDisplay, phoneHref, contactEmail }: { locale: Locale; phoneDisplay: string; phoneHref: string; contactEmail: string }) {
  const t = COPY[locale];
  const [v, setV] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState({ naam: false, email: false });
  const [status, setStatus] = useState<Status>('idle');

  const invalid = { naam: !v.naam.trim(), email: !EMAIL_RE.test(v.email.trim()) };
  const show = { naam: touched.naam && invalid.naam, email: touched.email && invalid.email };

  const field = (key: keyof Values) => ({
    name: key,
    value: v[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [key]: e.target.value }),
  });
  const check = (key: 'naam' | 'email') => ({
    'aria-invalid': show[key] || undefined,
    'aria-describedby': show[key] ? `${key}-err` : undefined,
    onBlur: () => setTouched((s) => ({ ...s, [key]: true })),
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (invalid.naam || invalid.email) {
      setTouched({ naam: true, email: true });
      const first = invalid.naam ? 'naam' : 'email';
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/aanvraag', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, locale }) });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) throw new Error(data.error || 'send failed');
      setStatus('sent');
      setV(EMPTY);
      setTouched({ naam: false, email: false });
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="aanvraag-form" onSubmit={submit} noValidate aria-label={t.label}>
      {status === 'sent' ? (
        <div className="form-success" role="status">
          <svg viewBox="0 0 52 52" width="56" height="56" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l8 8 14-16" /></svg>
          <h3>{t.sentTitle}</h3>
          <p className="form-hint">{t.sentText}</p>
        </div>
      ) : (
        <>
          <h3>{t.title}</h3>
          <p className="form-hint">{t.hint}</p>
          {status === 'error' && <p className="form-error">{t.error} <a href={phoneHref}>{phoneDisplay}</a> {t.or} <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>}
          <div className="field-row">
            <label>{t.naam}<input {...field('naam')} {...check('naam')} autoComplete="name" />{show.naam && <span className="field-error" id="naam-err">{t.naamErr}</span>}</label>
            <label>{t.bedrijf}<input {...field('bedrijf')} autoComplete="organization" /></label>
          </div>
          <div className="field-row">
            <label>{t.email}<input type="email" {...field('email')} {...check('email')} autoComplete="email" />{show.email && <span className="field-error" id="email-err">{t.emailErr}</span>}</label>
            <label>{t.telefoon}<input type="tel" {...field('telefoon')} autoComplete="tel" placeholder="06 12 34 56 78" /></label>
          </div>
          <label>{t.bericht}<textarea rows={4} {...field('bericht')} placeholder={t.berichtPh} /></label>
          <input className="hp-field" tabIndex={-1} aria-hidden="true" autoComplete="off" {...field('website')} />
          <button type="submit" className="button button-dark" disabled={status === 'sending'}>
            {status === 'sending' ? <><span className="spinner" aria-hidden="true" />{t.sending}</> : <>{t.send} <ArrowUpRight size={18} /></>}
          </button>
        </>
      )}
    </form>
  );
}
