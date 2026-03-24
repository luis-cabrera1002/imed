const CACHE_NAME = "imed-v4";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(fetch(event.request));
});

// ── Push Notifications ──
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "iMed", body: event.data.text() };
  }

  const title = data.title || "iMed Guatemala";
  const options = {
    body: data.body || "Tienes una notificación nueva",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "imed-notification",
    renotify: true,
    data: {
      url: data.url || "/patient-dashboard",
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );

  // Actualizar badge con número de notificaciones
  if (data.badgeCount && navigator.setAppBadge) {
    navigator.setAppBadge(data.badgeCount).catch(() => {});
  }
});

// ── Click en notificación ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/patient-dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, la enfocamos
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrimos una nueva
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── Limpiar badge al abrir la app ──
self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_BADGE") {
    if (navigator.clearAppBadge) {
      navigator.clearAppBadge().catch(() => {});
    }
  }
});
