// ── WikiPediaRF4 Service Worker ─────────────────────────────────────────────
// Versión: incrementar para forzar actualización de caché
const CACHE_VERSION = 'wrf4-v1';

// Recursos que se cachean en la instalación (shell de la app)
const APP_SHELL = [
  '/',
  '/index.html'
];

// Recursos que NUNCA se cachean (siempre van a la red)
const NEVER_CACHE = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'googleapis.com',
  'gstatic.com',
  'fcm.googleapis.com'
];

// ── INSTALL: cachear el app shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()) // activar inmediatamente
  );
});

// ── ACTIVATE: limpiar cachés viejas ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim()) // tomar control inmediatamente
  );
});

// ── FETCH: estrategia Network First con fallback a caché ──────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Ignorar peticiones no GET
  if (event.request.method !== 'GET') return;

  // Ignorar Firebase/APIs externas — siempre van a la red
  if (NEVER_CACHE.some(domain => url.includes(domain))) return;

  // Ignorar extensiones de Chrome
  if (url.startsWith('chrome-extension://')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la respuesta es válida, guardarla en caché
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const clone = networkResponse.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Sin red: intentar desde caché
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Si es navegación (HTML), devolver el index como fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = { title: 'WikiPediaRF4', body: event.data ? event.data.text() : 'Nueva notificación' };
  }

  const title   = data.title || 'WikiPediaRF4';
  const options = {
    body:    data.body    || 'Tenés una nueva notificación',
    icon:    data.icon    || '/icon-192.png',
    badge:   data.badge   || '/icon-192.png',
    image:   data.image   || undefined,
    tag:     data.tag     || 'wrf4-notif',
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || [
      { action: 'open',    title: 'Ver',     icon: '/icon-192.png' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Si ya hay una ventana abierta, enfocarla y navegar
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ── PUSH SUBSCRIPTION CHANGE ──────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then(subscription => {
        // Aquí podrías enviar la nueva suscripción a tu servidor
        console.log('[SW] Push subscription updated:', subscription);
      })
  );
});
