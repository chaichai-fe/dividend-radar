/**
 * A 股煤炭 / 电力周期红利股数据集。
 *
 * 数据来源：各公司年度报告、东方财富、同花顺等公开渠道。
 * 每股分红(dps)与现价(priceSeed)均为「兜底种子值」：
 *   - dps 默认由 server function 从东方财富分红接口实时算出(最新已公告完整年度合计)，
 *     抓取失败时才回退到此处的种子值；
 *   - priceSeed 同理，实时行情抓取失败时才使用。
 * 市净率(pb)为静态参考值。股息率 = 每股分红 / 现价 × 100%，会随实时股价动态变化。
 *
 * ⚠️ 本数据仅供学习与研究，数值为参考值，可能与最新公告存在偏差，不构成任何投资建议。
 */

export { rateBankYield as rateCyclicalYield } from '#/lib/bank-data'
export type { DividendRating, DividendTier, MarketCode } from '#/lib/bank-data'

import type { MarketCode } from '#/lib/bank-data'

export const CYCLICAL_DATA_DATE = '2026-06-17'

export type CyclicalCategory = '煤炭' | '电力'

export interface CyclicalSeed {
  /** 场内代码 */
  code: string
  /** 简称 */
  name: string
  /** 交易所 */
  market: MarketCode
  /** 行业分类 */
  category: CyclicalCategory
  /** 最近年度税前每股现金分红(元/股) */
  dps: number
  /** 市净率(参考值) */
  pb: number
  /** 现价回退值(实时抓取失败时使用) */
  priceSeed: number
}

export const CYCLICALS: Array<CyclicalSeed> = [
  // 煤炭
  { code: '601088', name: '中国神华', market: 'SH', category: '煤炭', dps: 1.03, pb: 1.6, priceSeed: 38.0 },
  { code: '601225', name: '陕西煤业', market: 'SH', category: '煤炭', dps: 0.909, pb: 2.0, priceSeed: 22.0 },
  { code: '601898', name: '中煤能源', market: 'SH', category: '煤炭', dps: 0.386, pb: 0.9, priceSeed: 11.0 },
  { code: '600188', name: '兖矿能源', market: 'SH', category: '煤炭', dps: 1.0, pb: 1.3, priceSeed: 14.0 },
  { code: '601699', name: '潞安环能', market: 'SH', category: '煤炭', dps: 0.7, pb: 1.0, priceSeed: 13.0 },
  { code: '600546', name: '山煤国际', market: 'SH', category: '煤炭', dps: 0.8, pb: 1.5, priceSeed: 12.0 },
  { code: '601666', name: '平煤股份', market: 'SH', category: '煤炭', dps: 0.6, pb: 1.0, priceSeed: 9.0 },
  { code: '600985', name: '淮北矿业', market: 'SH', category: '煤炭', dps: 0.66, pb: 0.9, priceSeed: 14.0 },
  { code: '000983', name: '山西焦煤', market: 'SZ', category: '煤炭', dps: 0.3, pb: 1.1, priceSeed: 8.0 },
  { code: '600971', name: '恒源煤电', market: 'SH', category: '煤炭', dps: 0.55, pb: 0.9, priceSeed: 8.0 },
  { code: '002128', name: '电投能源', market: 'SZ', category: '煤炭', dps: 0.7, pb: 1.4, priceSeed: 15.0 },
  { code: '600395', name: '盘江股份', market: 'SH', category: '煤炭', dps: 0.2, pb: 1.2, priceSeed: 5.0 },

  // 电力
  { code: '600900', name: '长江电力', market: 'SH', category: '电力', dps: 0.79, pb: 3.2, priceSeed: 29.0 },
  { code: '600011', name: '华能国际', market: 'SH', category: '电力', dps: 0.4, pb: 1.4, priceSeed: 8.0 },
  { code: '600027', name: '华电国际', market: 'SH', category: '电力', dps: 0.16, pb: 1.0, priceSeed: 6.0 },
  { code: '600795', name: '国电电力', market: 'SH', category: '电力', dps: 0.19, pb: 1.1, priceSeed: 5.0 },
  { code: '601985', name: '中国核电', market: 'SH', category: '电力', dps: 0.13, pb: 1.7, priceSeed: 10.0 },
  { code: '003816', name: '中国广核', market: 'SZ', category: '电力', dps: 0.1, pb: 2.0, priceSeed: 4.0 },
  { code: '600886', name: '国投电力', market: 'SH', category: '电力', dps: 0.28, pb: 1.6, priceSeed: 16.0 },
  { code: '600674', name: '川投能源', market: 'SH', category: '电力', dps: 0.5, pb: 2.0, priceSeed: 18.0 },
  { code: '600023', name: '浙能电力', market: 'SH', category: '电力', dps: 0.31, pb: 1.2, priceSeed: 6.0 },
  { code: '600642', name: '申能股份', market: 'SH', category: '电力', dps: 0.3, pb: 1.0, priceSeed: 9.0 },
  { code: '000543', name: '皖能电力', market: 'SZ', category: '电力', dps: 0.35, pb: 0.9, priceSeed: 8.0 },
  { code: '600863', name: '内蒙华电', market: 'SH', category: '电力', dps: 0.3, pb: 1.3, priceSeed: 5.0 },
  { code: '000539', name: '粤电力A', market: 'SZ', category: '电力', dps: 0.1, pb: 1.2, priceSeed: 5.0 },
  { code: '600483', name: '福能股份', market: 'SH', category: '电力', dps: 0.4, pb: 1.2, priceSeed: 11.0 },
]
