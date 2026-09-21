// Service worker voor de PetroShift Inbox: alleen pushmeldingen, geen caching,
// zodat er nooit oude gesprekken of een oude versie van de pagina verschijnt.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'PetroShift Inbox', {
      body: data.body || '',
      tag: data.tag || 'chat',
      renotify: true,
      icon: '/inbox-icon-192.png',
      badge: '/inbox-icon-192.png',
      data: { url: data.url || '/inbox' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/inbox', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (new URL(c.url).pathname.startsWith('/inbox') && 'focus' in c) {
          return c.focus().then(() => ('navigate' in c ? c.navigate(url) : undefined));
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
