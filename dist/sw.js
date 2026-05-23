const CACHE_NAME = "azhi-companion-v25-1-diary-persist";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=25-diary-persist",
  "./app.js?v=25-diary-persist",
  "./drive-targets.config.js?v=25-diary-persist",
  "./flowyear-standby-phrases.adapter.js?v=25-diary-persist",
  "./standby-phrases.json?v=25-diary-persist",
  "./manifest.webmanifest?v=25-diary-persist",
  "./assets/icons/icon-192.png?v=25",
  "./assets/icons/icon-512.png?v=25"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
