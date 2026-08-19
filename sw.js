const CACHE_NAME = 'app-cache-v1';

// ഓഫ്‌ലൈനായി ലഭ്യമാകേണ്ട പ്രധാന ഫയലുകൾ
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // നിങ്ങളുടെ CSS/JS/Image ഫയലുകൾ ഇവിടെ ചേർക്കുക (ഉദാ: './style.css', './app.js')
];

// Install Event: ഫയലുകൾ കാഷെ ചെയ്യുന്നു
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: പഴയ കാഷെ ക്ലിയർ ചെയ്യുന്നു
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: നെറ്റ്‌വർക്ക് ഇല്ലെങ്കിലും കാഷെയിൽ നിന്ന് ഡാറ്റ നൽകുന്നു (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // കാഷെയിൽ ഉണ്ടെങ്കിൽ അത് നൽകുക, ഇല്ലെങ്കിൽ നെറ്റ്‌വർക്കിൽ നിന്ന് എടുക്കുക
      return cachedResponse || fetch(event.request).catch(() => {
        // ഓഫ്‌ലൈൻ ഫാൾബാക്ക് (ഓപ്ഷണൽ)
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
