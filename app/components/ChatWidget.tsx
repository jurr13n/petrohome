'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send, X } from 'lucide-react';

type Msg = { id: number; from: 'visitor' | 'owner'; text: string; ts: number };
type Session = { id: string; token: string; seen: number };

const KEY = 'ps_chat_v1';
const COPY = {
  nl: {
    fab: 'Chat', fabLabel: 'Chat met ons', title: 'Chat met PetroShift', sub: 'We reageren zo snel mogelijk.',
    intro: 'Stel je vraag. Laat je naam en e-mail achter, dan kunnen we je ook later bereiken.',
    name: 'Naam', email: 'E-mail', message: 'Bericht', start: 'Start chat',
    consent: 'Door te versturen ga je akkoord met onze', privacy: 'privacyverklaring',
    placeholder: 'Typ een bericht…', send: 'Verstuur', close: 'Sluiten',
    invalid: 'Vul je naam, een geldig e-mailadres en een bericht in.', rate: 'Even rustig aan: probeer het over een paar minuten opnieuw.',
    failed: 'Versturen mislukt. Probeer het opnieuw of mail info@petroshift.nl.', waiting: 'We hebben je bericht ontvangen en reageren zo snel mogelijk.',
    again: 'Nieuw gesprek starten', closed: 'Dit gesprek is afgerond.', you: 'Jij', us: 'PetroShift',
  },
  en: {
    fab: 'Chat', fabLabel: 'Chat with us', title: 'Chat with PetroShift', sub: 'We reply as soon as we can.',
    intro: 'Ask your question. Leave your name and email so we can also reach you later.',
    name: 'Name', email: 'Email', message: 'Message', start: 'Start chat',
    consent: 'By sending you agree to our', privacy: 'privacy statement',
    placeholder: 'Type a message…', send: 'Send', close: 'Close',
    invalid: 'Please enter your name, a valid email address and a message.', rate: 'Slow down a little: please try again in a few minutes.',
    failed: 'Sending failed. Try again or email info@petroshift.nl.', waiting: 'We received your message and will reply as soon as we can.',
    again: 'Start a new conversation', closed: 'This conversation has been closed.', you: 'You', us: 'PetroShift',
  },
} as const;

const load = (): Session | null => {
  try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.id && v.token ? { seen: 0, ...v } : null; } catch { return null; }
};
const save = (s: Session | null) => {
  try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch { /* geen opslag beschikbaar */ }
};
const time = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ChatWidget() {
  const path = usePathname() || '/';
  const locale = path.startsWith('/en') ? 'en' : 'nl';
  const t = COPY[locale];
  const privacyHref = locale === 'en' ? '/en/privacy' : '/privacy';

  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [unseen, setUnseen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [draft, setDraft] = useState('');

  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const lastId = useRef(0);
  const seenRef = useRef(0);
  const idleSince = useRef(Date.now());
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  useEffect(() => {
    fetch('/api/chat/config').then((r) => r.json()).then((d) => setEnabled(!!d.enabled)).catch(() => {});
    const s = load();
    if (s) { setSession(s); seenRef.current = s.seen; }
  }, []);

  const apply = useCallback((incoming: Msg[]) => {
    if (!incoming.length) return;
    setMsgs((cur) => {
      const known = new Set(cur.map((m) => m.id));
      const fresh = incoming.filter((m) => !known.has(m.id));
      return fresh.length ? [...cur, ...fresh] : cur;
    });
    lastId.current = Math.max(lastId.current, ...incoming.map((m) => m.id));
    idleSince.current = Date.now();
  }, []);

  const poll = useCallback(async () => {
    const s = sessionRef.current;
    if (!s) return;
    try {
      const r = await fetch(`/api/chat/messages?id=${encodeURIComponent(s.id)}&after=${lastId.current}`, { headers: { 'x-chat-token': s.token }, cache: 'no-store' });
      if (r.status === 403 || r.status === 404) { save(null); setSession(null); setMsgs([]); return; }
      const d = await r.json();
      if (!d.ok) return;
      setClosed(d.status === 'closed');
      if (d.messages.length) {
        apply(d.messages);
        if (!openRef.current && d.messages.some((m: Msg) => m.from === 'owner' && m.id > seenRef.current)) setUnseen(true);
      }
    } catch { /* offline: volgende ronde opnieuw */ }
  }, [apply]);

  const openRef = useRef(open);
  openRef.current = open;

  // Rustig pollen: vlot als het paneel open is, traag als het dicht is, niet als de tab verborgen is.
  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (document.visibilityState === 'visible') await poll();
      const idle = Date.now() - idleSince.current > 60_000;
      timer = setTimeout(tick, openRef.current ? (idle ? 15_000 : 5_000) : 30_000);
    };
    tick();
    const onVis = () => { if (document.visibilityState === 'visible') poll(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
  }, [session?.id, poll]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) {
      setUnseen(false);
      idleSince.current = Date.now();
      if (session) { seenRef.current = lastId.current; save({ ...session, seen: lastId.current }); poll(); }
      setTimeout(() => panel.current?.querySelector<HTMLElement>('textarea, input:not([tabindex="-1"])')?.focus(), 60);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [msgs.length, open]);
  useEffect(() => { if (session && msgs.length && open) { seenRef.current = lastId.current; save({ ...session, seen: lastId.current }); } }, [msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab' || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>('button, a[href], input:not([tabindex="-1"]), textarea')].filter((el) => !el.hasAttribute('disabled'));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const post = async (url: string, body: unknown) => {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json().catch(() => ({ ok: false })) };
  };

  const start = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !form.message.trim()) { setError(t.invalid); return; }
    setBusy(true);
    try {
      const { status, data } = await post('/api/chat/start', { ...form, locale });
      if (status === 429) setError(t.rate);
      else if (!data.ok) setError(status === 400 ? t.invalid : data.detail ? `${t.failed} (${data.detail})` : t.failed);
      else {
        const s = { id: data.id, token: data.token, seen: 0 };
        lastId.current = 0; setMsgs([]); apply(data.messages || []);
        s.seen = lastId.current; seenRef.current = s.seen; save(s); setSession(s); setClosed(false);
        setForm({ name: '', email: '', message: '', website: '' });
      }
    } catch { setError(t.failed); }
    setBusy(false);
  };

  const send = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !session || busy) return;
    setBusy(true); setError('');
    try {
      const { status, data } = await post('/api/chat/send', { id: session.id, token: session.token, text });
      if (status === 429) setError(t.rate);
      else if (!data.ok) setError(data.detail ? `${t.failed} (${data.detail})` : t.failed);
      else { apply([data.message]); setDraft(''); setClosed(false); }
    } catch { setError(t.failed); }
    setBusy(false);
  };

  const onDraftKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
  };

  const reset = () => { save(null); setSession(null); setMsgs([]); lastId.current = 0; setClosed(false); setError(''); };

  if (!enabled || path.startsWith('/inbox')) return null;

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-modal="false" aria-label={t.title} ref={panel} onKeyDown={onKeyDown}>
          <header className="chat-head">
            <div><strong>{t.title}</strong><span>{t.sub}</span></div>
            <button type="button" className="chat-x" onClick={() => setOpen(false)} aria-label={t.close}><X size={18} /></button>
          </header>
          {!session ? (
            <form className="chat-form" onSubmit={start} noValidate>
              <p>{t.intro}</p>
              <label>{t.name}<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={100} /></label>
              <label>{t.email}<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" maxLength={200} /></label>
              <label>{t.message}<textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} /></label>
              <input className="hp-field" tabIndex={-1} aria-hidden="true" autoComplete="off" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p className="chat-error" role="alert">{error}</p>}
              <button type="submit" className="button button-dark" disabled={busy}>{busy ? '…' : t.start}</button>
              <small>{t.consent} <a href={privacyHref}>{t.privacy}</a>.</small>
            </form>
          ) : (
            <>
              <div className="chat-list" ref={list} aria-live="polite">
                {msgs.map((m) => (
                  <div key={m.id} className={`chat-msg ${m.from}`}>
                    <div className="chat-bubble">{m.text}</div>
                    <span>{m.from === 'owner' ? t.us : t.you} · {time(m.ts)}</span>
                  </div>
                ))}
                {msgs.length === 1 && msgs[0].from === 'visitor' && <p className="chat-note">{t.waiting}</p>}
                {closed && <p className="chat-note">{t.closed} <button type="button" className="chat-link" onClick={reset}>{t.again}</button></p>}
              </div>
              {error && <p className="chat-error" role="alert">{error}</p>}
              <form className="chat-compose" onSubmit={send}>
                <textarea rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onDraftKey} placeholder={t.placeholder} aria-label={t.placeholder} maxLength={2000} />
                <button type="submit" className="chat-send" disabled={busy || !draft.trim()} aria-label={t.send}><Send size={18} /></button>
              </form>
            </>
          )}
        </div>
      )}
      <button type="button" className={`chat-fab${open ? ' is-open' : ''}`} onClick={() => setOpen(!open)} aria-label={t.fabLabel} aria-expanded={open}>
        <MessageCircle size={20} /><span>{t.fab}</span>{unseen && !open && <i className="chat-dot" aria-hidden="true" />}
      </button>
    </>
  );
}
