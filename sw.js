const CACHE_NAME = 'yoshukai-app-v1.54';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install event: Cache the files individually to prevent total failure
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Loop through each file so one missing icon doesn't crash the whole app
      ASSETS_TO_CACHE.forEach(file => {
        cache.add(file).catch(err => console.error(`Failed to cache: ${file}`, err));
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event: Purge old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name doesn't match the current version, delete it
          if (cacheName !== CACHE_NAME) {
            console.log('Purging old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Ensure the updated service worker takes control of all clients immediately
  self.clients.claim();
});

// Fetch event: Serve from cache if available, otherwise go to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
