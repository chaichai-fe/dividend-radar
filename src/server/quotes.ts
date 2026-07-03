/**
 * 行情抓取工具：从腾讯行情接口批量抓取现价与涨跌幅，
 * 并用 Cloudflare Cache API 做边缘缓存(默认 45s)，避免高频请求被上游限流。
 *
 * 返回值为原始精度(不做四舍五入)，由调用方在展示层决定小数位。
 */

export interface LiveQuote {
  /** 现价 */
  price: number
  /** 当日涨跌幅(%) */
  changePct: number
}

const TENCENT_HEADERS = {
  Referer: 'https://gu.qq.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

/** 解析腾讯行情返回文本为 code → LiveQuote 映射。 */
function parseQuotes(text: string): Map<string, LiveQuote> {
  const result = new Map<string, LiveQuote>()
  for (const line of text.split(';')) {
    const match = line.match(/v_(sh|sz)(\d{6})="([^"]*)"/)
    if (!match) continue
    const code = match[2]
    const parts = match[3].split('~')
    const price = Number(parts[3])
    const changePct = Number(parts[32])
    if (Number.isFinite(price) && price > 0) {
      result.set(code, {
        price,
        changePct: Number.isFinite(changePct) ? changePct : 0,
      })
    }
  }
  return result
}

/** 读取边缘缓存中的文本；无缓存或运行环境不支持时返回 null。 */
export async function readEdgeCache(cacheKey: Request): Promise<string | null> {
  try {
    const cache = globalThis.caches?.default
    if (!cache) return null
    const hit = await cache.match(cacheKey)
    return hit ? await hit.text() : null
  } catch {
    return null
  }
}

/** 将文本写入边缘缓存(附 Cache-Control 使其可被缓存)。 */
export async function writeEdgeCache(cacheKey: Request, text: string, ttl: number) {
  try {
    const cache = globalThis.caches?.default
    if (!cache) return
    const res = new Response(text, {
      headers: {
        'Cache-Control': `max-age=${ttl}`,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
    await cache.put(cacheKey, res)
  } catch {
    // 缓存写入失败不影响主流程
  }
}

/**
 * 抓取一组标的的实时行情，带边缘缓存。
 * @param symbols 形如 "sh510880,sz159581" 的标的串
 * @param cacheName 缓存区分名(如 "etfs" / "banks")
 * @param ttl 缓存秒数，默认 45s
 */
export async function fetchLiveQuotes(
  symbols: string,
  cacheName: string,
  ttl = 45,
): Promise<Map<string, LiveQuote>> {
  const cacheKey = new Request(`https://quotes.internal/${cacheName}`)

  const cached = await readEdgeCache(cacheKey)
  if (cached != null) return parseQuotes(cached)

  try {
    const res = await fetch(`https://qt.gtimg.cn/q=${symbols}`, {
      headers: TENCENT_HEADERS,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return new Map()
    const text = await res.text()
    await writeEdgeCache(cacheKey, text, ttl)
    return parseQuotes(text)
  } catch {
    // 网络失败：返回空表，由调用方回退到种子数据
    return new Map()
  }
}
