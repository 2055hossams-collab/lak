
const CACHE_NAME = 'smart-accountant-pro-v5-offline';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/xlsx@0.18.5',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
  'https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=004b93',
  'https://img.icons8.com/color/48/pdf-2.png',
  'https://img.icons8.com/color/48/share--v1.png',
  'https://img.icons8.com/color/48/microsoft-excel-2019.png',
  'https://img.icons8.com/color/48/us-dollar-circled--v1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching all assets for offline mode...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      });
    })
  );
});
