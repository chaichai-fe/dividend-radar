import { createServerFn } from '@tanstack/react-start'
import { DATA_DATE, ETFS, INDEXES } from '#/lib/etf-data'
import type { MarketCode } from '#/lib/etf-data'
import { fetchLiveQuotes } from '#/server/quotes'

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
  const live = await fetchLiveQuotes(symbols, 'etfs')

  const rows: Array<EtfQuote> = ETFS.map((etf) => {
    const idx = INDEXES[etf.indexKey]
    const quote = live.get(etf.code)
    const price = quote ? quote.price : etf.navSeed
    // 口径统一：以数据日 navSeed 对应 yieldNow 反推每股年分红，
    // 价格变动时股息率随之动态变化(与银行一致，越便宜股息率越高)。
    const impliedAnnualDist = (idx.yieldNow / 100) * etf.navSeed
    const dividendYield =
      price > 0 ? (impliedAnnualDist / price) * 100 : idx.yieldNow
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
  }
})
