const CACHE_NAME = "azhi-companion-v25-3-mobile-ux-14";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=25-mobile-ux-14",
  "./app.js?v=25-mobile-ux-14",
  "./drive-targets.config.js?v=25-mobile-ux-14",
  "./flowyear-standby-phrases.adapter.js?v=25-mobile-ux-14",
  "./standby-phrases.json?v=25-mobile-ux-14",
  "./manifest.webmanifest?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-idle.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-bath.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-sleep.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-poop.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-hungry.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-flat.png?v=25-mobile-ux-14",
  "./assets/line-dog/line-dog-werewolf-note.png?v=25-mobile-ux-14",
  "./assets/icons/icon-192.png?v=25-mobile-ux-14",
  "./assets/icons/icon-512.png?v=25-mobile-ux-14"
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
