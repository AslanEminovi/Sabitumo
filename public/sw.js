// Service Worker for caching and performance optimization

const CACHE_NAME = 'sabitumo-cache-v1'
const STATIC_CACHE = 'sabitumo-static-v1'
const API_CACHE = 'sabitumo-api-v1'

// Cache different types of resources with different strategies
const STATIC_ASSETS = [
  '/',
  '/shop',
  '/categories',
  '/brands',
  '/about',
  '/contact',
  '/manifest.json',
  '/sabitumo1.png'
]

const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/brands'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      caches.open(API_CACHE)
    ])
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.includes('/api/')) {
      // API requests - Network First with cache fallback
      event.respondWith(networkFirstStrategy(request, API_CACHE))
    } else if (isStaticAsset(url.pathname)) {
      // Static assets - Cache First
      event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    } else if (url.pathname.includes('/images/') || url.pathname.includes('.jpg') || url.pathname.includes('.png') || url.pathname.includes('.webp')) {
      // Images - Cache First with network fallback
      event.respondWith(cacheFirstStrategy(request, CACHE_NAME))
    } else {
      // Pages - Network First with cache fallback
      event.respondWith(networkFirstStrategy(request, CACHE_NAME))
    }
  }
})

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Cache first strategy failed:', error)
    return new Response('Offline content not available', { status: 503 })
  }
}

// Network First Strategy (for dynamic content)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network first strategy falling back to cache:', error)
    
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response('Offline and no cached version available', { status: 503 })
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return pathname.includes('/_next/') || 
         pathname.includes('/static/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.ttf')
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Retry failed API requests when back online
  console.log('Background sync triggered')
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/sabitumo1.png',
    badge: '/sabitumo1.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Sabitumo', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})
