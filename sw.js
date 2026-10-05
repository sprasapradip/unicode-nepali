/* Offline cache for the Nepali Unicode Converter (cache-first for app shell, network-first for HTML).
 * Author: Pradip Subedi (@sprasapradip) - https://github.com/sprasapradip/unicode-nepali */
const CACHE = 'nuc-v2.0.0';
const SHELL = ['./', 'index.html', 'assets/app.js', 'assets/icon.svg', 'src/nepali-converter.js', 'manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
