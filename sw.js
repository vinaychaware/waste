// Service Worker for Smart Waste Management System
// Implements offline caching and push notification handling

const CACHE_NAME = 'smart-waste-v1.0.0';
const STATIC_CACHE_NAME = 'smart-waste-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'smart-waste-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/modules/router.js',
  '/js/modules/auth.js',
  '/js/modules/api.js',
  '/js/modules/i18n.js',
  '/js/modules/utils.js',
  '/js/components/toast.js',
  '/js/components/modal.js',
  '/js/pages/login.js',
  '/js/pages/citizen-dashboard.js',
  '/js/pages/worker-dashboard.js',
  '/js/pages/admin-dashboard.js',
  '/js/pages/superadmin-dashboard.js',
  '/manifest.json'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/complaints/,
  /\/api\/workers/,
  /\/api\/vehicles/,
  /\/api\/analytics/
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests with appropriate caching strategies
  if (STATIC_FILES.includes(url.pathname) || url.pathname === '/') {
    // Cache-first strategy for static files
    event.respondWith(cacheFirstStrategy(request));
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // Network-first strategy for API calls
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.startsWith('/assets/')) {
    // Cache-first strategy for assets
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Network-first strategy for everything else
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache-first strategy implementation
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    
    // Return offline fallback if available
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Network-first strategy implementation
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return appropriate offline response
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires internet connection' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Push notification event handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'Smart Waste Management',
    body: 'You have a new notification',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'general',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/action-dismiss.png'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }
  
  // Handle notification click actions
  let urlToOpen = '/';
  
  if (action === 'view' || !action) {
    if (notificationData.url) {
      urlToOpen = notificationData.url;
    } else if (notificationData.type) {
      switch (notificationData.type) {
        case 'complaint':
          urlToOpen = '/complaints';
          break;
        case 'vehicle':
          urlToOpen = '/track';
          break;
        case 'task':
          urlToOpen = '/tasks';
          break;
        default:
          urlToOpen = '/dashboard';
      }
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event handler (for offline form submissions)
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'complaint-sync') {
    event.waitUntil(syncComplaints());
  } else if (event.tag === 'attendance-sync') {
    event.waitUntil(syncAttendance());
  }
});

// Sync offline complaints when connection is restored
async function syncComplaints() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    
    const offlineComplaints = requests.filter(request => 
      request.url.includes('/api/complaints') && request.method === 'POST'
    );
    
    for (const request of offlineComplaints) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log('Offline complaint synced successfully');
        }
      } catch (error) {
        console.error('Failed to sync offline complaint:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing complaints:', error);
  }
}

// Sync offline attendance when connection is restored
async function syncAttendance() {
  try {
    // Implementation for syncing offline attendance data
    console.log('Syncing offline attendance data...');
    // This would sync any cached attendance submissions
  } catch (error) {
    console.error('Error syncing attendance:', error);
  }
}

// Handle service worker updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});