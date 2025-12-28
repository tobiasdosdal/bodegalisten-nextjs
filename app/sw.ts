import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate } from "serwist";

// Extended event types for modern PWA APIs
interface BackgroundSyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PeriodicBackgroundSyncEvent extends ExtendableEvent {
  readonly tag: string;
}

interface PushNotificationEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// Queue for background sync (offline marker updates)
const SYNC_QUEUE_NAME = "bodegalisten-sync-queue";
const pendingRequests: Array<{ url: string; method: string; body: string }> = [];

// Enhanced runtime caching for API routes and assets
const runtimeCaching = [
  // API routes - Network first with cache fallback
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/maps"),
    handler: new NetworkFirst({
      cacheName: "api-maps-cache",
      networkTimeoutSeconds: 10,
      plugins: [],
    }),
  },
  // Static assets - Cache first
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/splash/") ||
      url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif)$/),
    handler: new CacheFirst({
      cacheName: "static-assets-cache",
      plugins: [],
    }),
  },
  // Fonts - Cache first with long expiration
  {
    matcher: ({ url }: { url: URL }) =>
      url.pathname.match(/\.(woff2?|ttf|otf|eot)$/) ||
      url.hostname.includes("fonts.googleapis.com") ||
      url.hostname.includes("fonts.gstatic.com"),
    handler: new CacheFirst({
      cacheName: "fonts-cache",
      plugins: [],
    }),
  },
  // Tile servers for maps - Stale while revalidate
  {
    matcher: ({ url }: { url: URL }) =>
      url.hostname.includes("tile.openstreetmap.org") ||
      url.hostname.includes("tiles.") ||
      url.hostname.includes("basemaps."),
    handler: new StaleWhileRevalidate({
      cacheName: "map-tiles-cache",
      plugins: [],
    }),
  },
  // Default cache for everything else
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Queue request for background sync
  if (event.data?.type === "QUEUE_REQUEST") {
    pendingRequests.push(event.data.request);
    // Try to register for sync
    self.registration.sync?.register(SYNC_QUEUE_NAME).catch(() => {
      // Sync not supported, will retry on next online event
    });
  }

  // Clear badge
  if (event.data?.type === "CLEAR_BADGE") {
    navigator.clearAppBadge?.();
  }

  // Set badge count
  if (event.data?.type === "SET_BADGE" && typeof event.data.count === "number") {
    navigator.setAppBadge?.(event.data.count);
  }
});

// Background Sync handler
self.addEventListener("sync", (event) => {
  const syncEvent = event as BackgroundSyncEvent;
  if (syncEvent.tag === SYNC_QUEUE_NAME) {
    syncEvent.waitUntil(processPendingRequests());
  }
});

async function processPendingRequests() {
  while (pendingRequests.length > 0) {
    const request = pendingRequests.shift();
    if (request) {
      try {
        await fetch(request.url, {
          method: request.method,
          body: request.body,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        // Put it back in the queue if it fails
        pendingRequests.unshift(request);
        throw new Error("Sync failed, will retry");
      }
    }
  }
}

// Periodic Background Sync for refreshing data
self.addEventListener("periodicsync", (event) => {
  const periodicEvent = event as PeriodicBackgroundSyncEvent;
  if (periodicEvent.tag === "refresh-maps") {
    periodicEvent.waitUntil(refreshMapsData());
  }
});

async function refreshMapsData() {
  try {
    const cache = await caches.open("api-maps-cache");
    const response = await fetch("/api/maps");
    if (response.ok) {
      await cache.put("/api/maps", response);
    }
  } catch {
    // Silently fail - will try again next time
  }
}

// Handle Share Target
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle share target POST requests
  if (url.pathname === "/share-target" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const text = formData.get("text") as string;
    const url = formData.get("url") as string;

    // Redirect to main page with shared data as query params
    const redirectUrl = new URL("/", self.location.origin);
    if (title) redirectUrl.searchParams.set("shared_title", title);
    if (text) redirectUrl.searchParams.set("shared_text", text);
    if (url) redirectUrl.searchParams.set("shared_url", url);

    return Response.redirect(redirectUrl.toString(), 303);
  } catch {
    return Response.redirect("/", 303);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  const pushEvent = event as PushNotificationEvent;
  if (!pushEvent.data) return;

  try {
    const data = pushEvent.data.json();
    const options = {
      body: data.body || "Ny opdatering fra Bodegalisten",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag || "bodegalisten-notification",
      renotify: data.renotify || false,
    };

    pushEvent.waitUntil(
      self.registration.showNotification(data.title || "Bodegalisten", options)
    );
  } catch {
    // Invalid push data
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

serwist.addEventListeners();
