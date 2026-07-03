import { createServerFn } from '@tanstack/react-start'
import { DATA_DATE, ETFS, INDEXES } from '#/lib/etf-data'
import type { MarketCode } from '#/lib/etf-data'
import { fetchLiveQuotes } from '#/server/quotes'
import { fetchIndexYields } from '#/server/index-yields'

export interface EtfQuote {
  code: string
  name: string
  market: MarketCode
  indexCode: string
  indexName: string
  indexDesc: string
  manager: string
  scale: number
  fee: number
  dividendFreq: string
  /** 现价 / 净值 */
  nav: number
  /** 当日涨跌幅(%) */
  changePct: number
  /** 现价是否为实时抓取(false 表示回退到静态种子值) */
  live: boolean
  /** 参考股息率(%) —— 采用跟踪指数股息率 */
  dividendYield: number
  /** dividendYield 是否来自实时指数股息率(false 表示回退到静态种子值) */
  yieldLive: boolean
  avgYield: number
  pe: number
  peLow: number
  peHigh: number
  pb: number
  pbLow: number
  pbHigh: number
  yieldLow: number
  yieldHigh: number
  dataDate: string
}

export const listEtfs = createServerFn({ method: 'GET' }).handler(async () => {
  const symbols = ETFS.map(
    (e) => (e.market === 'SH' ? 'sh' : 'sz') + e.code,
  ).join(',')
  const [live, indexYields] = await Promise.all([
    fetchLiveQuotes(symbols, 'etfs'),
    fetchIndexYields('etfs'),
  ])

  const rows: Array<EtfQuote> = ETFS.map((etf) => {
    const idx = INDEXES[etf.indexKey]
    const quote = live.get(etf.code)
    const price = quote ? quote.price : etf.navSeed
    // 优先采用实时指数股息率(已按指数当前点位计算，含价格因素)；
    // 若该指数无实时数据，则回退到指数层面的静态股息率 yieldNow。
    // 注意：不再用「yieldNow × navSeed ÷ 现价」反推——navSeed 一旦过时会
    // 严重放大股息率(如 navSeed=1.3 而现价 0.94 时把 6.4% 抬到 8.8%)。
    const liveIdxYield = indexYields.get(idx.code.toUpperCase())
    const yieldLive = liveIdxYield != null
    const dividendYield = liveIdxYield ? liveIdxYield.yieldNow : idx.yieldNow
    return {
      code: etf.code,
      name: etf.name,
      market: etf.market,
      indexCode: idx.code,
      indexName: idx.name,
      indexDesc: idx.desc,
      manager: etf.manager,
      scale: etf.scale,
      fee: etf.fee,
      dividendFreq: etf.dividendFreq,
      nav: price,
      changePct: quote ? quote.changePct : 0,
      live: Boolean(quote),
      dividendYield,
      yieldLive,
      avgYield: idx.avgYield,
      pe: idx.pe,
      peLow: idx.peLow,
      peHigh: idx.peHigh,
      pb: idx.pb,
      pbLow: idx.pbLow,
      pbHigh: idx.pbHigh,
      yieldLow: idx.yieldLow,
      yieldHigh: idx.yieldHigh,
      dataDate: DATA_DATE,
    }
  })

  return {
    rows,
    fetchedAt: new Date().toISOString(),
    liveCount: rows.filter((r) => r.live).length,
    yieldLiveCount: rows.filter((r) => r.yieldLive).length,
  }
})
