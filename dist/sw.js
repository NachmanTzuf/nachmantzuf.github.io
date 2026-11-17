const CACHE_NAME = 'earpa-pwa-v40';
const ASSETS_TO_CACHE = [
  '/',
  '/?source=pwa',
  'index.html',
  'manifest.json',
  'manifest.webmanifest',
  'favicon.ico',
  '/images/icons/earpa_icon_192.png',
  '/images/icons/earpa_icon_512.png',
  '/images/icons/earpa_icon_maskable_192.png',
  '/images/icons/earpa_icon_maskable_512.png',
  '/images/icons/apple_touch_icon.png',
  '/images/icons/favicon.png',
  '/images/earpa_master_loading_bg.jpg',
  '/images/earpa_journey_bg.jpg',
  '/images/tri_realm_sanctuary.jpg',
  '/images/artisan_workshop_dual_harp.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[Earpa SW] Pre-cache note:', url, err);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Bypass Service Worker completely for video streams and HTTP Range requests
  if (req.url.includes('/videos/') || req.url.endsWith('.mp4') || req.headers.get('range')) {
    return;
  }

  // HTML Navigation: Network-first so users always receive latest bundle references
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match('/index.html') || caches.match('/')))
    );
    return;
  }

  // Static Assets (Hashed JS, CSS, images, 3D models, manifest): Cache-first or Stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && req.method === 'GET') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkResponse;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch {}
  event.waitUntil(self.registration.showNotification('Earpa · Daily practice', {
    body: typeof payload.body === 'string' ? payload.body : 'A few minutes to listen, find your tonic, and play.',
    icon: '/images/icons/earpa_icon_192.png',
    tag: 'earpa-daily-practice',
    data: { url: '/' },
  }));
});

async function checkAndFireStoredReminder() {
  try {
    const cache = await caches.open('earpa-meta-v1');
    const res = await cache.match('/earpa-reminder-config.json');
    if (!res) return false;
    const cfg = await res.json();
    if (!cfg || !cfg.enabled || !/^([01]\d|2[0-3]):[0-5]\d$/.test(cfg.time || '')) {
      return false;
    }
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (cfg.lastNotifiedDate === today) return false;

    const [h, m] = cfg.time.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes < h * 60 + m) return false;

    const prompts = Array.isArray(cfg.prompts) && cfg.prompts.length > 0
      ? cfg.prompts
      : [{ title: 'Earpa · Daily Practice Reminder', body: 'Your Celtic harp misses your fingers! Take 10 relaxing minutes to find your tonic.' }];
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];

    await self.registration.showNotification(prompt.title, {
      body: prompt.body,
      icon: '/images/icons/earpa_icon_192.png',
      badge: '/images/icons/earpa_icon_192.png',
      tag: 'earpa-daily-practice',
      data: { url: '/' },
    });

    cfg.lastNotifiedDate = today;
    await cache.put(
      '/earpa-reminder-config.json',
      new Response(JSON.stringify(cfg), { headers: { 'Content-Type': 'application/json' } })
    );
    return true;
  } catch {
    return false;
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'earpa-daily-reminder') {
    event.waitUntil(checkAndFireStoredReminder());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'earpa-daily-reminder-sync') {
    event.waitUntil(checkAndFireStoredReminder());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'EARPA_CHECK_REMINDER') {
    event.waitUntil(checkAndFireStoredReminder());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
    const home = new URL('/', self.location.origin).href;
    for (const client of clients) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.focus();
        return;
      }
    }
    return self.clients.openWindow(home);
  }));
});
