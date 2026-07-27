/**
 * 十年期国债收益率：从东方财富「中美国债收益率」接口抓取最新值，
 * 用 Cloudflare Cache API 做边缘缓存(默认 6h)。失败时回退到静态参考值。
 *
 * 字段 EMM00166466 = 中国国债收益率10年(%)。
 * 来源：https://data.eastmoney.com/cjsj/zmgzsyl.html
 */

import { createServerFn } from '@tanstack/react-start'
import { BOND_YIELD_10Y_FALLBACK } from '#/lib/rating'
import { readEdgeCache, writeEdgeCache } from '#/server/quotes'

export interface BondYieldQuote {
  /** 十年国债收益率(%) */
  yield: number
  /** 对应交易日(YYYY-MM-DD)，回退时为空串 */
  date: string
  /** 是否为实时抓取 */
  live: boolean
}

const EM_HEADERS = {
  Referer: 'https://data.eastmoney.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

async function fetchBondYield10Y(ttl = 60 * 60 * 6): Promise<BondYieldQuote> {
  const cacheKey = new Request('https://bond-yield.internal/cn10y')

  const cached = await readEdgeCache(cacheKey)
  if (cached != null) {
    try {
      const parsed = JSON.parse(cached) as BondYieldQuote
      if (
        typeof parsed.yield === 'number' &&
        Number.isFinite(parsed.yield) &&
        parsed.yield > 0
      ) {
        return { ...parsed, live: true }
      }
    } catch {
      // 缓存损坏则重新抓取
    }
  }

  try {
    const params = new URLSearchParams({
      type: 'RPTA_WEB_TREASURYYIELD',
      sty: 'ALL',
      st: 'SOLAR_DATE',
      sr: '-1',
      token: '894050c76af8597a853f5b408b759f5d',
      p: '1',
      ps: '5',
      pageNo: '1',
      pageNum: '1',
    })
    const res = await fetch(
      `https://datacenter.eastmoney.com/api/data/get?${params}`,
      { headers: EM_HEADERS, signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) {
      return {
        yield: BOND_YIELD_10Y_FALLBACK,
        date: '',
        live: false,
      }
    }
    const json: {
      result?: {
        data?: Array<{ SOLAR_DATE?: string; EMM00166466?: number | null }>
      }
    } = await res.json()
    const row = json.result?.data?.[0]
    const y = Number(row?.EMM00166466)
    if (!row || !Number.isFinite(y) || y <= 0) {
      return {
        yield: BOND_YIELD_10Y_FALLBACK,
        date: '',
        live: false,
      }
    }
    const date = (row.SOLAR_DATE ?? '').slice(0, 10)
    const quote: BondYieldQuote = { yield: y, date, live: true }
    await writeEdgeCache(cacheKey, JSON.stringify(quote), ttl)
    return quote
  } catch {
    return {
      yield: BOND_YIELD_10Y_FALLBACK,
      date: '',
      live: false,
    }
  }
}

export const getBondYield10Y = createServerFn({ method: 'GET' }).handler(
  async () => fetchBondYield10Y(),
)
