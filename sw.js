const CACHE_PREFIX = "nicogym-";
const CACHE_VERSION = "shell-v12";
const SHELL_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-v1`;
const MAX_RUNTIME_CACHE_ENTRIES = 120;
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css?v=20261001c",
  "./img/logo-nicogym-600.jpg",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./js/config.js",
  "./js/exercise-names.js",
  "./js/exercises.js?v=20261001b",
  "./js/exercise-library.js?v=20260923e",
  "./js/helpers.js?v=20261001b",
  "./js/routines.js?v=20261001e",
  "./js/cargas.js",
  "./js/storage.js?v=20261001b",
  "./js/state.js?v=20260923a",
  "./js/ui.js?v=20261001b",
  "./js/modal.js",
  "./js/records.js?v=20261001a",
  "./js/progression.js",
  "./js/app.js?v=20261001c",
  "./js/dashboard.js?v=20261001a",
  "./js/workouts.js?v=20261001e",
  "./js/week.js?v=20261001a",
  "./js/weight.js?v=20260826",
  "./js/stats.js?v=20261001a",
  "./js/agenda.js?v=20260923a",
  "./js/photos.js?v=20261001a",
  "./js/settings.js?v=20261001a",
  "./js/comparador.js?v=20261001a",
  "./js/objetivos.js?v=20261001a",
  "./js/history.js?v=20261001a",
  "./js/init.js?v=20261001a",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") {
          await cache.put(request, response.clone());
          const keys = await cache.keys();
          const excess = keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_CACHE_ENTRIES));
          await Promise.all(excess.map((key) => cache.delete(key)));
        }
        return response;
      } catch {
        return new Response("", { status: 503, statusText: "Offline" });
      }
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () =>
      await caches.match(request) || await caches.match(new URL("./index.html", self.registration.scope)),
    ));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});