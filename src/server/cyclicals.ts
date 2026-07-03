import { createServerFn } from '@tanstack/react-start'
import { CYCLICALS, CYCLICAL_DATA_DATE } from '#/lib/cyclical-data'
import type { CyclicalCategory, MarketCode } from '#/lib/cyclical-data'
import { fetchLiveQuotes } from '#/server/quotes'
import { fetchDividends } from '#/server/dividends'

export interface CyclicalQuote {
  code: string
  name: string
  market: MarketCode
  category: CyclicalCategory
  /** 现价 */
  price: number
  /** 当日涨跌幅(%) */
  changePct: number
  /** 现价是否为实时抓取(false 表示回退到种子值) */
  live: boolean
  /** 最新已公告年度税前每股现金分红(元/股，前瞻口径，含预案) */
  dps: number
  /** dps 是否来自实时接口(false 表示回退到种子值) */
  dpsLive: boolean
  /** dps 对应的会计年度(如 2025)；来自种子值时为 null */
  dpsYear: number | null
  /** 股息率(%) = 每股分红 / 现价 × 100 */
  dividendYield: number
  pb: number
  dataDate: string
}

export const listCyclicals = createServerFn({ method: 'GET' }).handler(
  async () => {
    const symbols = CYCLICALS.map(
      (c) => (c.market === 'SH' ? 'sh' : 'sz') + c.code,
    ).join(',')
    const codes = CYCLICALS.map((c) => c.code)
    const [live, dividends] = await Promise.all([
      fetchLiveQuotes(symbols, 'cyclicals'),
      fetchDividends(codes, 'cyclicals'),
    ])

    const rows: Array<CyclicalQuote> = CYCLICALS.map((stock) => {
      const quote = live.get(stock.code)
      const price = quote ? quote.price : stock.priceSeed
      const div = dividends.get(stock.code)
      const dps = div ? div.dps : stock.dps
      // 股息率 = 每股分红 / 现价 × 100，保留原始精度，仅在展示层四舍五入。
      const dividendYield = price > 0 ? (dps / price) * 100 : 0
      return {
        code: stock.code,
        name: stock.name,
        market: stock.market,
        category: stock.category,
        price,
        changePct: quote ? quote.changePct : 0,
        live: Boolean(quote),
        dps,
        dpsLive: Boolean(div),
        dpsYear: div ? div.fiscalYear : null,
        dividendYield,
        pb: stock.pb,
        dataDate: CYCLICAL_DATA_DATE,
      }
    })

    return {
      rows,
      fetchedAt: new Date().toISOString(),
      liveCount: rows.filter((r) => r.live).length,
      dpsLiveCount: rows.filter((r) => r.dpsLive).length,
    }
  },
)
