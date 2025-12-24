// Service Worker для Gogo Пицца PWA
const CACHE_NAME = 'gogo-pizza-v6';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icon.svg'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Установка...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Кэш открыт');
                return cache.addAll(urlsToCache).catch((error) => {
                    console.log('Service Worker: Некоторые ресурсы не удалось кэшировать:', error);
                });
            })
    );
    // Принудительная активация нового Service Worker
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Активация...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Взятие контроля над всеми страницами
    return self.clients.claim();
});

// Перехват запросов (Network First для dev, Cache First для production)
self.addEventListener('fetch', (event) => {
    // Пропускаем не-GET запросы
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // Пропускаем запросы к внешним ресурсам (кроме нашего origin)
    if (url.origin !== self.location.origin && !url.href.includes('cdn.tailwindcss.com')) {
        return;
    }

    // Для навигационных запросов (загрузка страницы) - только HTML документы
    if (event.request.mode === 'navigate' || 
        (event.request.destination === 'document' && (url.pathname === '/' || url.pathname === '/index.html'))) {
        
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Если есть в сети, кэшируем и возвращаем
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put('/index.html', responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Если сети нет, пытаемся получить из кэша
                    return caches.match('/index.html')
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('Service Worker: Возвращаем index.html из кэша (офлайн)');
                                return cachedResponse;
                            }
                            // Если и в кэше нет, возвращаем fallback
                            return new Response('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Gogo Пицца</title></head><body><p>Офлайн режим. Загрузка...</p></body></html>', {
                                headers: { 'Content-Type': 'text/html' }
                            });
                        });
                })
        );
        return;
    }

    // Для всех остальных запросов используем Network First стратегию
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Если есть в сети, кэшируем и возвращаем
                if (response && response.status === 200 && response.type !== 'error') {
                    const responseToCache = response.clone();
                    const contentType = response.headers.get('content-type') || '';
                    
                    // Кэшируем все кроме HTML (HTML обрабатывается отдельно)
                    if (!contentType.includes('text/html')) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request.clone(), responseToCache).catch((err) => {
                                console.log('Service Worker: Ошибка кэширования:', err);
                            });
                        });
                    }
                }
                return response;
            })
            .catch(() => {
                // Если сети нет, пытаемся получить из кэша
                return caches.match(event.request, { ignoreSearch: true })
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('Service Worker: Возвращаем из кэша (офлайн):', event.request.url);
                            return cachedResponse;
                        }
                        
                        // Если нет в кэше, пытаемся найти похожий (без query параметров)
                        const urlWithoutQuery = event.request.url.split('?')[0];
                        return caches.match(urlWithoutQuery, { ignoreSearch: true })
                            .then((similarCached) => {
                                if (similarCached) {
                                    console.log('Service Worker: Найден похожий ресурс в кэше:', urlWithoutQuery);
                                    return similarCached;
                                }
                                
                                // Для JS файлов - НИКОГДА не возвращаем HTML!
                                if (event.request.url.match(/\.(js|mjs|jsx|ts|tsx)$/i) || 
                                    event.request.url.includes('/@vite/') ||
                                    event.request.url.includes('/node_modules/') ||
                                    event.request.destination === 'script') {
                                    console.error('Service Worker: JS файл не найден в кэше (офлайн):', event.request.url);
                                    // Возвращаем пустой JS, чтобы не ломать приложение
                                    return new Response('console.warn("Resource offline:", "' + event.request.url + '");', { 
                                        status: 200,
                                        headers: new Headers({
                                            'Content-Type': 'application/javascript'
                                        })
                                    });
                                }
                                
                                // Для CSS файлов
                                if (event.request.url.match(/\.(css)$/i) || event.request.destination === 'style') {
                                    return new Response('/* Offline */', { 
                                        status: 200,
                                        headers: new Headers({
                                            'Content-Type': 'text/css'
                                        })
                                    });
                                }
                                
                                // Для изображений возвращаем пустой ответ
                                if (event.request.destination === 'image' || 
                                    event.request.url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
                                    return new Response('', { 
                                        status: 404,
                                        statusText: 'Not Found'
                                    });
                                }
                                
                                // Для других типов возвращаем ошибку
                                return new Response('Offline', { 
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: new Headers({
                                        'Content-Type': 'text/plain'
                                    })
                                });
                            });
                    });
            })
    );
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от Gogo Пицца',
        icon: '/pwa-icon.svg',
        badge: '/pwa-icon.svg',
        vibrate: [200, 100, 200],
        tag: 'gogo-pizza-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Открыть приложение'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Gogo Пицца', options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Открываем приложение при клике на уведомление
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Если есть открытое окно, фокусируем его
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Если окна нет, открываем новое
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Фоновая синхронизация (для офлайн-заказов)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(
            // Здесь можно добавить логику синхронизации заказов
            console.log('Синхронизация заказов...')
        );
    }
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Обработка запроса на показ уведомления
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});
