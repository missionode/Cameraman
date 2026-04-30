const CACHE_NAME = 'cameraman-pwa-v35';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './handbook.json',
  './recorder.worker.js',
  './video-processor.worker.js',
  './ai-v2.worker.js',
  './vision_classic.js',
  './icon-192.svg',
  './icon-512.svg',
  './favicon.ico'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force update
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v35');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Handle External AI Assets (MediaPipe / Google Storage)
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Default Strategy: Network First, then Cache (to ensure updates are seen)
  // [IMPORTANT] Changing to Network-First to prevent "Old Code" bugs during development
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Take control immediately
    ])
  );
});
