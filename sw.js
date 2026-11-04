// Streak — offline service worker
const CACHE = "streak-v2";
const ASSETS = ["./", "./index.html", "./streak.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // The page and its scripts: network-first so updates show (and stay in
  // sync) when online, cache offline.
  if (req.mode === "navigate" || req.destination === "script") {
    const key = req.mode === "navigate" ? "./index.html" : req;
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(key, copy));
          return res;
        })
        .catch(() => caches.match(key))
    );
    return;
  }

  // Other assets: cache-first.
  e.respondWith(
    caches.match(req).then(r =>
      r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
    )
  );
});
