const CACHE = "pruebas-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
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
  const url = new URL(e.request.url);

  // Las llamadas al backend Railway siempre van a la red
  if (url.hostname.includes("railway.app") || url.hostname.includes("up.railway.app")) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: "Sin conexión — mostrando datos guardados" }), {
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // Google Classroom API siempre en red
  if (url.hostname.includes("googleapis.com") || url.hostname.includes("accounts.google.com")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Todo lo demás: cache primero, red como respaldo
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
