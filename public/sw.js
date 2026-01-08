/// <reference lib="webworker" />

const CACHE_NAME = 'nexu-store-v1';
const STATIC_CACHE_NAME = 'nexu-static-v1';
const IMAGE_CACHE_NAME = 'nexu-images-v1';

// Core app shell to cache
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/cart',
  '/offline',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('nexu-') && 
                   name !== CACHE_NAME && 
                   name !== STATIC_CACHE_NAME &&
                   name !== IMAGE_CACHE_NAME;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first with cache fallback for pages
// Cache first for static assets and images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls and admin routes (always network)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // Skip Stripe and external resources
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets: Cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isImageRequest(request)) {
    // Images: Cache first with longer TTL
    event.respondWith(cacheFirst(request, IMAGE_CACHE_NAME));
  } else if (isNavigationRequest(request)) {
    // Pages: Network first with offline fallback
    event.respondWith(networkFirst(request));
  }
});

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.woff');
}

// Check if request is for image
function isImageRequest(request) {
  const url = new URL(request.url);
  return request.destination === 'image' ||
         url.pathname.startsWith('/uploads/') ||
         url.pathname.startsWith('/icons/') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.avif') ||
         url.pathname.endsWith('.svg');
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         request.headers.get('accept')?.includes('text/html');
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first fetch failed:', error);
    // Return a fallback for images
    if (isImageRequest(request)) {
      return new Response('', { status: 404 });
    }
    throw error;
  }
}

// Network first strategy with offline fallback
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network first fetch failed, trying cache:', error);
    
    // Try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (isNavigationRequest(request)) {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    // Return error response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for cart (future implementation)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  // Future: Sync cart with server when back online
  console.log('[SW] Syncing cart...');
}
