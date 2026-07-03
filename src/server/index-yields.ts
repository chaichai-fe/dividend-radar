/**
 * 指数股息率抓取工具：从韭圈儿(jiucaishuo)指数估值数据中一次性拉取
 * 全部指数的最新股息率(以及 PE/PB)，并用 Cloudflare Cache API 做边缘缓存。
 *
 * 口径说明：返回的 gu_xilv 是「按指数当前价位算出的股息率」，即
 *   股息率 = 指数近12月现金分红 / 指数当前点位 × 100，
 * 已包含当前市场价格因素，可直接作为跟踪该指数的 ETF 的参考股息率。
 *
 * 指数股息率一天只更新一次，故缓存周期较长(默认 12h)。抓取失败时返回空表，
 * 由调用方回退到 etf-data 中的静态 yieldNow。
 */

import { readEdgeCache, writeEdgeCache } from '#/server/quotes'

export interface IndexYield {
  /** 最新股息率(%) */
  yieldNow: number
  /** 该股息率对应的日期(如 2026-07-03) */
  date: string
}

interface CategoryRow {
  gu_code?: string
  gu_xilv?: string | number
  gu_date?: string
}

const JCS_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

/** 归一化指数代码：取「.」前的证券代码并大写(如 h30269.CSI → H30269)。 */
function normalizeCode(raw: string | undefined): string {
  return (raw ?? '').split('.')[0].toUpperCase()
}

/** 将韭圈儿列表解析为 归一化指数代码 → IndexYield 映射(仅保留股息率 > 0)。 */
function reduceYields(rows: Array<CategoryRow>): Map<string, IndexYield> {
  const result = new Map<string, IndexYield>()
  for (const row of rows) {
    const code = normalizeCode(row.gu_code)
    if (!code) continue
    const y = Number(row.gu_xilv)
    if (!Number.isFinite(y) || y <= 0) continue
    result.set(code, { yieldNow: y, date: row.gu_date ?? '' })
  }
  return result
}

/**
 * 抓取全部指数的最新股息率，带边缘缓存。
 * @param cacheName 缓存区分名(如 'etfs')
 * @param ttl 缓存秒数，默认 12h
 * @returns 归一化指数代码 → IndexYield，抓取失败时为空表
 */
export async function fetchIndexYields(
  cacheName: string,
  ttl = 60 * 60 * 12,
): Promise<Map<string, IndexYield>> {
  const cacheKey = new Request(`https://index-yields.internal/${cacheName}`)

  const cached = await readEdgeCache(cacheKey)
  if (cached != null) {
    try {
      return reduceYields(JSON.parse(cached) as Array<CategoryRow>)
    } catch {
      // 缓存损坏则重新抓取
    }
  }

  try {
    const res = await fetch('https://api.jiucaishuo.com/v2/guzhi/showcategory', {
      method: 'POST',
      headers: JCS_HEADERS,
      body: '{}',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return new Map()
    const json: {
      code?: number
      data?: { right_list?: Array<CategoryRow> }
    } = await res.json()
    const data = json.data?.right_list
    if (json.code !== 0 || !Array.isArray(data)) return new Map()
    await writeEdgeCache(cacheKey, JSON.stringify(data), ttl)
    return reduceYields(data)
  } catch {
    // 网络失败：返回空表，由调用方回退到静态种子值
    return new Map()
  }
}
