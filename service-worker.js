/* ============================================================
   Service Worker — Tìm Cờ (kiểu "ưu tiên mạng")
   - Có mạng: LUÔN lấy bản mới nhất từ GitHub (tự cập nhật).
   - Mất mạng: dùng bản đã lưu để chơi offline.
   => Sau này update game, bạn CHỈ CẦN thay index.html,
      KHÔNG cần đổi version gì cả.
   ============================================================ */
const CACHE = 'tim-co';
const ASSETS = [
  './','./index.html','./manifest.json',
  './icon-192.png','./icon-512.png','./icon-maskable-512.png',
  './apple-touch-icon.png','./favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

/* Ưu tiên mạng: thử tải bản mới trước, lưu lại; mất mạng thì dùng bản đã lưu */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});
