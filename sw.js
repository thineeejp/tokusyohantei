// Service Worker for 自動火災報知設備 判定アプリ
const CACHE_NAME = 'fire-alarm-app-v1.0.0';
const STATIC_CACHE = 'fire-alarm-static-v1.0.0';

// キャッシュするファイル一覧
const CACHE_FILES = [
  './',
  './index.html',
  './styles.css',
  './hantei.js',
  './ui.js',
  './main.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/favicon.svg',
  // 外部リソース
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
  console.log('[SW] インストール中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] ファイルをキャッシュ中...');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] インストール完了');
        // 新しいService Workerを即座にアクティブにする
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] インストール中にエラー:', error);
      })
  );
});

// Service Worker のアクティベーション
self.addEventListener('activate', (event) => {
  console.log('[SW] アクティベート中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 古いキャッシュを削除
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('[SW] 古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] アクティベート完了');
        // 全てのクライアントを制御下に置く
        return self.clients.claim();
      })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', (event) => {
  // GET リクエストのみ処理
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // キャッシュにある場合はそれを返す
        if (cachedResponse) {
          console.log('[SW] キャッシュから取得:', event.request.url);
          return cachedResponse;
        }
        
        // キャッシュにない場合はネットワークから取得
        console.log('[SW] ネットワークから取得:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // レスポンスが有効でない場合は返さない
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] ネットワークエラー:', error);
            
            // オフライン時のフォールバック
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            
            // その他のリソースの場合はエラーを返す
            throw error;
          });
      })
  );
});

// Service Worker の更新通知
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] 更新をスキップして即座にアクティベート');
    self.skipWaiting();
  }
});

// プッシュ通知の処理（将来の拡張用）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '新しい判定結果が利用可能です',
      icon: '/icons/icon.svg',
      badge: '/icons/favicon.svg',
      tag: 'fire-alarm-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'アプリを開く'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '火災報知設備判定アプリ', options)
    );
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

console.log('[SW] Service Worker が読み込まれました');