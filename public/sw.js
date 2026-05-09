const CACHE_NAME = "morganfinance-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// Handle notification clicks - focus existing tab or open the deep-linked URL
// iOS-safe: action buttons are not supported on iOS, so the body tap must
// always navigate. client.navigate() can fail on iOS (cross-scope, suspended
// clients), so we fall back to openWindow().
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // If user tapped the "Dismiss" action, do nothing further
  if (event.action === "dismiss") return;

  const rawUrl =
    (event.notification.data && event.notification.data.url) || "/dashboard";
  // Resolve to an absolute URL within our scope so iOS handles it correctly
  const targetUrl = new URL(rawUrl, self.registration.scope).href;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Try to reuse an existing window first
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          const targetParsed = new URL(targetUrl);
          if (clientUrl.origin === targetParsed.origin) {
            // Focus first (required on iOS before navigation takes effect)
            if ("focus" in client) {
              try {
                await client.focus();
              } catch (_) {}
            }
            // Try navigate; if it throws (iOS often rejects), fall back to openWindow
            if ("navigate" in client) {
              try {
                await client.navigate(targetUrl);
                return;
              } catch (_) {
                // fall through to openWindow
              }
            } else {
              // Older clients: post a message so the SPA can route in-app
              try {
                client.postMessage({ type: "navigate", url: targetUrl });
                return;
              } catch (_) {}
            }
          }
        } catch (_) {
          // ignore and continue
        }
      }

      // No reusable window — open a new one (works on iOS)
      if (self.clients.openWindow) {
        try {
          await self.clients.openWindow(targetUrl);
        } catch (_) {}
      }
    })()
  );
});
