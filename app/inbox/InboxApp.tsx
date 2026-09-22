'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, Bell, BellOff, Check, LogOut, Mail, Send, Trash2 } from 'lucide-react';

type Msg = { id: number; from: 'visitor' | 'owner'; text: string; ts: number };
type Conv = { id: string; name: string; email: string; locale: 'nl' | 'en'; createdAt: number; lastAt: number; lastFrom: 'visitor' | 'owner'; lastText: string; unread: number; status: 'open' | 'closed' };
type Auth = 'checking' | 'login' | 'in';

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const b64ToBytes = (s: string) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
const when = (ts: number) => {
  const d = new Date(ts), now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
};

async function api(url: string, body?: unknown, method = 'POST') {
  const r = await fetch(url, body === undefined && method === 'GET' ? { cache: 'no-store' } : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return { status: r.status, data: await r.json().catch(() => ({ ok: false })) };
}

export default function InboxApp() {
  const [auth, setAuth] = useState<Auth>('checking');
  const [pw, setPw] = useState('');
  const [loginError, setLoginError] = useState('');
  const [convs, setConvs] = useState<Conv[]>([]);
  const [pushConfigured, setPushConfigured] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [notif, setNotif] = useState<'unsupported' | 'off' | 'on' | 'denied'>('off');
  const [notifMsg, setNotifMsg] = useState('');
  const [needsInstall, setNeedsInstall] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeRef = useRef<string | null>(null);
  const lastId = useRef(0);
  const list = useRef<HTMLDivElement>(null);
  activeRef.current = active;

  const current = convs.find((c) => c.id === active) || null;
  const unreadTotal = convs.reduce((n, c) => n + c.unread, 0);

  const loadList = useCallback(async () => {
    const { status, data } = await api('/api/inbox/conversations', undefined, 'GET');
    if (status === 401) { setAuth('login'); return; }
    if (data.ok) { setConvs(data.conversations); setPushConfigured(!!data.push); setAuth('in'); }
  }, []);

  const loadThread = useCallback(async (id: string, reset = false) => {
    if (reset) { lastId.current = 0; setMsgs([]); }
    const { data } = await api(`/api/inbox/conversations/${encodeURIComponent(id)}?after=${lastId.current}`, undefined, 'GET');
    if (!data.ok || activeRef.current !== id) return;
    if (data.messages.length) {
      lastId.current = Math.max(lastId.current, ...data.messages.map((m: Msg) => m.id));
      setMsgs((cur) => { const known = new Set(cur.map((m) => m.id)); return [...cur, ...data.messages.filter((m: Msg) => !known.has(m.id))]; });
      if (data.messages.some((m: Msg) => m.from === 'visitor')) { await api('/api/inbox/read', { id }); loadList(); }
    }
  }, [loadList]);

  const open = useCallback(async (id: string) => {
    setActive(id); activeRef.current = id; setDraft(''); setConfirmDelete(false);
    history.replaceState(null, '', `/inbox?c=${id}`);
    await loadThread(id, true);
    await api('/api/inbox/read', { id });
    loadList();
  }, [loadThread, loadList]);

  const back = () => { setActive(null); setConfirmDelete(false); history.replaceState(null, '', '/inbox'); loadList(); };

  useEffect(() => { loadList(); }, [loadList]);

  // Deep link vanuit een melding
  useEffect(() => {
    if (auth !== 'in' || activeRef.current) return;
    const id = new URLSearchParams(location.search).get('c');
    if (id && convs.some((c) => c.id === id)) open(id);
  }, [auth, convs, open]);

  useEffect(() => {
    if (auth !== 'in') return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      loadList();
      if (activeRef.current) loadThread(activeRef.current);
    };
    const t = setInterval(tick, 5000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick); };
  }, [auth, loadList, loadThread]);

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }); }, [msgs.length, active]);

  // Pushstatus: service worker registreren en kijken of dit apparaat al is aangemeld.
  useEffect(() => {
    if (auth !== 'in') return;
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setNeedsInstall(ios && !standalone);
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { setNotif('unsupported'); return; }
    if (Notification.permission === 'denied') { setNotif('denied'); return; }
    navigator.serviceWorker.register('/inbox-sw.js', { scope: '/inbox' })
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.pushManager.getSubscription())
      .then(async (sub) => {
        if (sub && Notification.permission === 'granted') { setNotif('on'); await api('/api/inbox/push', { subscription: sub.toJSON() }); }
      })
      .catch(() => {});
  }, [auth]);

  const enableNotifications = async () => {
    setNotifMsg('');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setNotif(perm === 'denied' ? 'denied' : 'off'); return; }
      const reg = await navigator.serviceWorker.register('/inbox-sw.js', { scope: '/inbox' });
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID) }));
      const { data } = await api('/api/inbox/push', { subscription: sub.toJSON() });
      if (data.ok) { setNotif('on'); setNotifMsg('Meldingen staan aan op dit apparaat.'); } else setNotifMsg('Opslaan van het apparaat mislukte.');
    } catch { setNotifMsg('Meldingen aanzetten lukte niet op dit apparaat.'); }
  };
  const disableNotifications = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/inbox');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) { await api('/api/inbox/push', { endpoint: sub.endpoint }, 'DELETE'); await sub.unsubscribe(); }
      setNotif('off'); setNotifMsg('');
    } catch { /* negeren */ }
  };
  const testNotification = async () => {
    const { status, data } = await api('/api/inbox/push/test');
    if (data.configured === undefined) { setNotifMsg(`Testmelding mislukt (HTTP ${status}: ${data.error || 'onbekend'}${data.detail ? ` – ${data.detail}` : ''}).`); return; }
    if (data.sent) { setNotifMsg(`Testmelding verstuurd naar ${data.sent} van ${data.subs} apparaat/apparaten.`); return; }
    const why = !data.configured ? `de VAPID-sleutels ontbreken op de server (publiek: ${data.has?.public ? 'ja' : 'nee'}, privé: ${data.has?.private ? 'ja' : 'nee'})` : data.subs === 0 ? 'geen apparaat aangemeld op de server' : `verzenden mislukte: ${(data.errors || []).join('; ')}`;
    setNotifMsg(`Geen testmelding: ${why}.`);
  };

  const login = async (e: FormEvent) => {
    e.preventDefault(); setLoginError(''); setBusy(true);
    const { status, data } = await api('/api/inbox/login', { password: pw });
    setBusy(false);
    if (data.ok) { setPw(''); setAuth('in'); loadList(); }
    else setLoginError(status === 429 ? 'Te veel pogingen. Probeer het over een kwartier opnieuw.' : status === 503 ? 'De inbox is nog niet ingericht (wachtwoord of opslag ontbreekt).' : 'Onjuist wachtwoord.');
  };
  const logout = async () => { await api('/api/inbox/logout'); setAuth('login'); setActive(null); setConvs([]); setMsgs([]); };

  const reply = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !active || busy) return;
    setBusy(true);
    const { data } = await api('/api/inbox/reply', { id: active, text });
    setBusy(false);
    if (data.ok) { setDraft(''); setMsgs((cur) => (cur.some((m) => m.id === data.message.id) ? cur : [...cur, data.message])); lastId.current = Math.max(lastId.current, data.message.id); loadList(); }
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); reply(); } };
  const toggleClosed = async () => { if (!current) return; await api('/api/inbox/close', { id: current.id, status: current.status === 'open' ? 'closed' : 'open' }); loadList(); };

  // Verwijderen vraagt een tweede tik binnen 4 s te bevestigen, in plaats van een systeempopup.
  const askDelete = () => {
    setConfirmDelete(true);
    clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmDelete(false), 4000);
  };
  const deleteConv = async () => {
    if (!current) return;
    clearTimeout(confirmTimer.current);
    setBusy(true);
    const { data } = await api('/api/inbox/delete', { id: current.id });
    setBusy(false);
    if (data.ok) {
      setConfirmDelete(false);
      setConvs((cur) => cur.filter((c) => c.id !== current.id));
      setActive(null); activeRef.current = null; setMsgs([]);
      history.replaceState(null, '', '/inbox');
    }
  };

  if (auth === 'checking') return <main className="ib-center"><p className="ib-muted">Laden…</p></main>;

  if (auth === 'login') {
    return (
      <main className="ib-center">
        <form className="ib-login" onSubmit={login}>
          <img src="/petroshift-logo-header.png" alt="PetroShift" width="532" height="132" />
          <h1>Inbox</h1>
          <label>Wachtwoord<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus /></label>
          {loginError && <p className="ib-error" role="alert">{loginError}</p>}
          <button type="submit" className="button" disabled={busy || !pw}>{busy ? '…' : 'Inloggen'}</button>
        </form>
      </main>
    );
  }

  return (
    <main className={`ib${active ? ' has-active' : ''}`}>
      <header className="ib-bar">
        <strong>Inbox{unreadTotal > 0 && <em className="ib-badge">{unreadTotal}</em>}</strong>
        <div className="ib-bar-actions">
          {notif === 'on'
            ? <button type="button" onClick={disableNotifications} aria-label="Meldingen uitzetten"><Bell size={18} /></button>
            : <button type="button" onClick={enableNotifications} aria-label="Meldingen aanzetten" disabled={notif === 'unsupported' || notif === 'denied' || !VAPID}><BellOff size={18} /></button>}
          <button type="button" onClick={logout} aria-label="Uitloggen"><LogOut size={18} /></button>
        </div>
      </header>

      <section className="ib-notice" aria-live="polite">
        {needsInstall && <p>Op iPhone werken meldingen pas nadat je deze pagina aan je beginscherm toevoegt (deelknop, dan “Zet op beginscherm”) en de app daar opent.</p>}
        {notif === 'denied' && <p>Meldingen zijn geblokkeerd voor deze site. Zet ze aan in de instellingen van je browser of telefoon.</p>}
        {notif === 'unsupported' && !needsInstall && <p>Dit apparaat ondersteunt geen pushmeldingen in de browser.</p>}
        {notif === 'off' && !needsInstall && pushConfigured && <p>Je krijgt nog geen melding bij een nieuw bericht. <button type="button" className="ib-link" onClick={enableNotifications}>Meldingen aanzetten</button></p>}
        {!pushConfigured && <p>Pushmeldingen zijn nog niet ingericht (VAPID-sleutels ontbreken).</p>}
        {notif === 'on' && <p>Meldingen staan aan. <button type="button" className="ib-link" onClick={testNotification}>Testmelding sturen</button></p>}
        {notifMsg && <p><strong>{notifMsg}</strong></p>}
      </section>

      <div className="ib-body">
        <nav className="ib-list" aria-label="Gesprekken">
          {convs.length === 0 && <p className="ib-muted ib-pad">Nog geen gesprekken.</p>}
          {convs.map((c) => (
            <button key={c.id} type="button" className={`ib-item${c.id === active ? ' on' : ''}${c.status === 'closed' ? ' done' : ''}`} onClick={() => open(c.id)}>
              <span className="ib-item-top"><strong>{c.name}</strong><span className="ib-item-meta">{c.unread > 0 && <em className="ib-badge">{c.unread}</em>}<time>{when(c.lastAt)}</time></span></span>
              <span className="ib-item-text">{c.lastFrom === 'owner' ? 'Jij: ' : ''}{c.lastText}</span>
            </button>
          ))}
        </nav>

        <section className="ib-thread" aria-label="Gesprek">
          {!current ? <p className="ib-muted ib-pad ib-empty">Kies een gesprek.</p> : (
            <>
              <header className="ib-thread-head">
                <button type="button" className="ib-back" onClick={back} aria-label="Terug naar gesprekken"><ArrowLeft size={20} /></button>
                <div><strong>{current.name}</strong><a href={`mailto:${current.email}`}><Mail size={13} /> {current.email}</a></div>
                <button type="button" className="ib-done" onClick={toggleClosed}>{current.status === 'open' ? <><Check size={15} /> Afronden</> : 'Heropen'}</button>
                {confirmDelete ? (
                  <button type="button" className="ib-delete confirm" onClick={deleteConv} disabled={busy} onBlur={() => setConfirmDelete(false)}>Zeker weten?</button>
                ) : (
                  <button type="button" className="ib-delete" onClick={askDelete} aria-label="Gesprek verwijderen"><Trash2 size={16} /></button>
                )}
              </header>
              <div className="ib-msgs" ref={list}>
                {msgs.map((m) => (
                  <div key={m.id} className={`chat-msg ${m.from}`}>
                    <div className="chat-bubble">{m.text}</div>
                    <span>{m.from === 'owner' ? 'Jij' : current.name} · {when(m.ts)}</span>
                  </div>
                ))}
              </div>
              <form className="chat-compose" onSubmit={reply}>
                <textarea rows={1} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} placeholder="Typ een antwoord…" aria-label="Antwoord" maxLength={2000} />
                <button type="submit" className="chat-send" disabled={busy || !draft.trim()} aria-label="Verstuur"><Send size={18} /></button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
