/*
 * Control de Horas Laborales - Service Worker
 * © 2025 Augusto Caldara. Todos los derechos reservados.
 * Uso no autorizado prohibido.
 */

const CACHE_NAME = 'chl-v1';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json'
];

// Al instalar: guarda todo en caché
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS);
    })
  );
  self.skipWaiting();
});

// Al activar: limpia caches viejos
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Al pedir recursos: primero caché, luego red
self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request).then(cached => {
      if (cached) return cached;
      return fetch(evento.request).then(response => {
        // Si llega de la red, guardarlo en caché también
        if (response && response.status === 200) {
          const copia = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(evento.request, copia);
          });
        }
        return response;
      }).catch(() => {
        // Si no hay red ni caché, devolver index.html igual
        return caches.match('./index.html');
      });
    })
  );
});
