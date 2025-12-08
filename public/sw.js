const CACHE_NAME = 'guitar-jam-buddy-v11';
const urlsToCache = [
  // App Shell & Entry Point
  '/',
  '/index.html',

  // Manifest & Icons
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',

  // Audio Assets
  '/assets/sounds/kick.wav',
  '/assets/sounds/snare.wav',
  '/assets/sounds/hihat.wav'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching essential assets');
        // Use addAll with a catch block to prevent install failure if one asset is missing
        return cache.addAll(urlsToCache).catch(error => {
          console.warn('Failed to cache some initial assets:', error);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // For AI API calls, we always go to the network.
  // If the network fails, we return an error response.
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Die App ist offline. KI-Funktionen sind nicht verfügbar.' }), {
          status: 503, // Service Unavailable
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-First strategy for core app files
  const isAppShell = url.pathname === '/' || url.pathname === '/index.html';
  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // If successful, clone the response and update the cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If network fails, serve from the cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || new Response("App is offline and content is not cached.", { status: 404 });
          });
        })
    );
    return;
  }

  // Cache-First strategy for all other static assets (sounds, icons, etc.)
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // If the resource is in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the resource is not in the cache, fetch it from the network.
        return fetch(event.request).then(networkResponse => {
          // If we got a valid response, clone it and cache it.
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
          }

          // Return the network response.
          return networkResponse;
        });
      });
    })
  );
});