const CACHE_VERSION = "knowing-word-static-v1";
const IMMUTABLE_PREFIX = "/assets/";
const REVALIDATED_PREFIXES = ["/illustrations/", "/heritage/"];

globalThis.addEventListener("install", (event) => {
  event.waitUntil(globalThis.skipWaiting());
});

globalThis.addEventListener("activate", (event) => {
  event.waitUntil(
    globalThis.caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith("knowing-word-static-") && key !== CACHE_VERSION)
        .map((key) => globalThis.caches.delete(key)),
    )).then(() => globalThis.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cache = await globalThis.caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, request) {
  const cache = await globalThis.caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const refresh = fetch(request).then(async (response) => {
    if (response.ok) await cache.put(request, response.clone());
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.then(() => undefined).catch(() => undefined));
    return cached;
  }
  return refresh;
}

globalThis.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== globalThis.location.origin) return;

  if (url.pathname.startsWith(IMMUTABLE_PREFIX)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (REVALIDATED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) || url.pathname === "/og-cover.jpg") {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});
