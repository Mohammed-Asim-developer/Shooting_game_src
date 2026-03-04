// اسم الكاش مع رقم الإصدار
const CACHE_NAME = "shooting-game-v2";

// الملفات التي تريد كاشها عند أول تحميل
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./Script.js", // سكريبتات اللعبة
    "./manifest.json", // سكريبتات اللعبة
    "./ShootingSound.mp3",
    "./reload_sound.mp3",
    "https://raw.githubusercontent.com///main/bullet_icon.png",
   // "./bullet_icon.png",
    "./BulletHole.png",
    "./colorful-archery-target.png",
    "./hand-with-gun-png.png",
    "./magazine_reload.png",
    "./map.gif"
];

// أثناء التثبيت: cache الملفات الأساسية
self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting()) // تجعل الـ SW يتحكم فوراً
    );
});

// عند تفعيل الـ SW: حذف أي كاش قديم
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // يسيطر على الصفحات فورًا
});

// التقاط الطلبات: cache-first strategy
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse; // إذا موجود في الكاش، أرجعه
            }
            // إذا مش موجود، جلبه من الشبكة
            return fetch(event.request)
                .then(response => {
                    // خزنه في الكاش للاستخدام لاحقًا
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // هنا ممكن تضيف صفحة offline.html أو رسالة
                });
        })
    );
});
