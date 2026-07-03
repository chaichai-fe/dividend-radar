import { createServerFn } from '@tanstack/react-start'
import { BANKS, BANK_DATA_DATE } from '#/lib/bank-data'
import type { BankCategory, MarketCode } from '#/lib/bank-data'
import { fetchLiveQuotes } from '#/server/quotes'
import { fetchDividends } from '#/server/dividends'

export interface BankQuote {
  code: string
  name: string
  market: MarketCode
  category: BankCategory
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

export const listBanks = createServerFn({ method: 'GET' }).handler(async () => {
  const symbols = BANKS.map(
    (b) => (b.market === 'SH' ? 'sh' : 'sz') + b.code,
  ).join(',')
  const codes = BANKS.map((b) => b.code)
  const [live, dividends] = await Promise.all([
    fetchLiveQuotes(symbols, 'banks'),
    fetchDividends(codes, 'banks'),
  ])

  const rows: Array<BankQuote> = BANKS.map((bank) => {
    const quote = live.get(bank.code)
    const price = quote ? quote.price : bank.priceSeed
    const div = dividends.get(bank.code)
    const dps = div ? div.dps : bank.dps
    // 股息率 = 每股分红 / 现价 × 100，保留原始精度，仅在展示层四舍五入。
    const dividendYield = price > 0 ? (dps / price) * 100 : 0
    return {
      code: bank.code,
      name: bank.name,
      market: bank.market,
      category: bank.category,
      price,
      changePct: quote ? quote.changePct : 0,
      live: Boolean(quote),
      dps,
      dpsLive: Boolean(div),
      dpsYear: div ? div.fiscalYear : null,
      dividendYield,
      pb: bank.pb,
      dataDate: BANK_DATA_DATE,
    }
  })

  return {
    rows,
    fetchedAt: new Date().toISOString(),
    liveCount: rows.filter((r) => r.live).length,
    dpsLiveCount: rows.filter((r) => r.dpsLive).length,
  }
})
