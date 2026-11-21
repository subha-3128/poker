// Poker Night PWA Service Worker — Version 7.0 (Mobile Polish & Layout Optimization)
const CACHE_NAME = 'poker-night-v7';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/socket-client.js',
  '/js/chip-renderer.js',
  '/js/audio.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: Cache critical static shell & take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell v2');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Purge old caches (e.g. poker-night-v1) and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// 1. Bypass Socket.IO & dynamic API endpoints
// 2. Navigation / HTML: Network-first with cache fallback (ensures fresh deploy loads immediately)
// 3. Static assets: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Only handle GET requests; never cache POST/PUT/DELETE requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Never intercept Socket.IO or dynamic API endpoints
  if (url.pathname.startsWith('/socket.io/') || url.pathname.startsWith('/api/') || url.pathname === '/health') {
    return;
  }

  // Navigation requests (HTML pages): Network-First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html') || caches.match('/'))
    );
    return;
  }

  // Static Assets: Network-first with Cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
