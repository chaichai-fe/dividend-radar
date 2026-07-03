/* 红利雷达 Service Worker
 * 策略：
 *  - 导航请求(HTML)：stale-while-revalidate —— 命中缓存立即返回(消除启动白屏)，
 *    后台再拉取最新页面更新缓存；无缓存时走网络，离线回退首页外壳
 *  - 静态资源(/assets、图标、css、js)：stale-while-revalidate
 *  - 其它请求(server function / 行情等)：直连网络，不缓存
 */
const VERSION = 'v5'
const STATIC_CACHE = `dr-static-${VERSION}`
const PAGE_CACHE = `dr-pages-${VERSION}`

const PRECACHE = ['/', '/etfs', '/banks', '/portfolio', '/manifest.json']

// 从已预缓存的 HTML 里解析出构建产物(带 hash 的核心 JS/CSS)并一并预缓存。
// 这样安装完成后即便是「首次冷启动/离线」，核心脚本样式也已就绪、无需网络，
// 且随 SW 版本升级自动跟随最新构建，无需手动维护 hash 文件名。
async function precacheAssetsFrom(pageCache) {
  const staticCache = await caches.open(STATIC_CACHE)
  const assets = new Set()
  for (const url of ['/', '/etfs', '/banks', '/portfolio']) {
    const res = await pageCache.match(url)
    if (!res) continue
    const html = await res.text()
    const re = /(?:src|href)="(\/assets\/[^"']+\.(?:js|css))"/g
    let m
    while ((m = re.exec(html))) assets.add(m[1])
  }
  await Promise.allSettled([...assets].map((u) => staticCache.add(u)))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE)
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
      await precacheAssetsFrom(cache)
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE)
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(?:css|js|png|svg|ico|webp|woff2?)$/.test(url.pathname) ||
    url.pathname === '/manifest.json'
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 导航请求：stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE)
        const cached = await cache.match(request)

        // 后台静默更新缓存(不阻塞首屏渲染)
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone())
            return res
          })
          .catch(() => null)

        // 命中缓存 → 立即返回外壳，启动即出画面；
        // 未命中 → 等网络；网络也失败 → 回退首页外壳 / 离线错误
        if (cached) return cached
        const fresh = await network
        return fresh || (await cache.match('/')) || Response.error()
      })(),
    )
    return
  }

  // 静态资源：stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((res) => {
            if (res && res.ok) cache.put(request, res.clone())
            return res
          })
          .catch(() => cached)
        return cached || network
      })(),
    )
    return
  }

  // 其它请求(server function / 行情)：不拦截，走默认网络
})
