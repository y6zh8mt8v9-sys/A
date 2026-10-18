/* Gridiron 27: offline support for the home-screen app.
   The game page is fetched fresh when there is a connection (so uploads reach players on their next launch)
   and served from the cache when there is none. Fonts and the online-play library are cached the first time
   they load; online-play traffic itself is never cached. */
const VERSION = 'g27-beta-7';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];
const RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    // one missing file must not block the install, so each is added on its own
    await Promise.all(CORE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== VERSION && key !== VERSION + '-ext') await caches.delete(key);
    await self.clients.claim();
  })());
});

async function pageFromNetwork(request) {
  const cache = await caches.open(VERSION);
  try {
    // revalidate with the server (cheap 304 when the file did not change), give up after 6 seconds
    const response = await Promise.race([
      fetch(request, { cache: 'no-cache' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
    ]);
    if (response && response.ok) { cache.put('./index.html', response.clone()); return response; }
    throw new Error('bad response');
  } catch (e) {
    return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && url.origin === self.location.origin) { event.respondWith(pageFromNetwork(request)); return; }
  if (url.origin === self.location.origin) {
    // icons, manifest, launch screens: cache first
    event.respondWith((async () => {
      const cache = await caches.open(VERSION), hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })());
    return;
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    // fonts and the online library: serve the cached copy at once, refresh it in the background
    event.respondWith((async () => {
      const cache = await caches.open(VERSION + '-ext'), hit = await cache.match(request);
      const fresh = fetch(request).then((response) => { if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()); return response; }).catch(() => null);
      return hit || (await fresh) || Response.error();
    })());
  }
  // everything else (the Supabase server for accounts, matches and records) goes straight to the network
});
