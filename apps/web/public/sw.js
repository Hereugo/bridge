const CACHE = "bridge-shell-v1";
const SHELL = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api") || url.pathname.includes("livekit")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((res) => {
          if (res.ok && url.origin === self.location.origin && !url.pathname.includes(".")) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
      );
    })
  );
});
