const TENCENT_HEADERS = {
  Referer: "https://gu.qq.com/",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
};
function parseQuotes(text) {
  const result = /* @__PURE__ */ new Map();
  for (const line of text.split(";")) {
    const match = line.match(/v_(sh|sz)(\d{6})="([^"]*)"/);
    if (!match) continue;
    const code = match[2];
    const parts = match[3].split("~");
    const price = Number(parts[3]);
    const changePct = Number(parts[32]);
    if (Number.isFinite(price) && price > 0) {
      result.set(code, {
        price,
        changePct: Number.isFinite(changePct) ? changePct : 0
      });
    }
  }
  return result;
}
async function readEdgeCache(cacheKey) {
  try {
    const cache = globalThis.caches?.default;
    if (!cache) return null;
    const hit = await cache.match(cacheKey);
    return hit ? await hit.text() : null;
  } catch {
    return null;
  }
}
async function writeEdgeCache(cacheKey, text, ttl) {
  try {
    const cache = globalThis.caches?.default;
    if (!cache) return;
    const res = new Response(text, {
      headers: {
        "Cache-Control": `max-age=${ttl}`,
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
    await cache.put(cacheKey, res);
  } catch {
  }
}
async function fetchLiveQuotes(symbols, cacheName, ttl = 45) {
  const cacheKey = new Request(`https://quotes.internal/${cacheName}`);
  const cached = await readEdgeCache(cacheKey);
  if (cached != null) return parseQuotes(cached);
  try {
    const res = await fetch(`https://qt.gtimg.cn/q=${symbols}`, {
      headers: TENCENT_HEADERS,
      signal: AbortSignal.timeout(5e3)
    });
    if (!res.ok) return /* @__PURE__ */ new Map();
    const text = await res.text();
    await writeEdgeCache(cacheKey, text, ttl);
    return parseQuotes(text);
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
export {
  fetchLiveQuotes as f,
  readEdgeCache as r,
  writeEdgeCache as w
};
