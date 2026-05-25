const CACHE_NAME = 'pautazero-v1';
const API_CACHE = 'pautazero-api-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js'
];

// Instalação: pré-cache de assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Estratégia: Stale-while-revalidate para API, Cache-first para estáticos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache de borda para a API de artigos (stale-while-revalidate)
  if (url.pathname.startsWith('/api/portais')) {
    event.respondWith(
      caches.open(API_CACHE).then(cache => {
        return cache.match(event.request).then(cached => {
          const fetched = fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
          return cached || fetched;
        });
      })
    );
  } else {
    // Cache-first para assets estáticos (imagens, fontes, CSS)
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});

// Limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(key => key !== CACHE_NAME && key !== API_CACHE).map(key => caches.delete(key)))
    )
  );
});
