/**
 * 红利 ETF 估值评级。
 *
 * 方法论（透明、可解释）：
 * 以“当前指标在该指数多年区间中的位置”作为便宜度(0~100)，越高越便宜。
 * 注意：这是区间线性位置，不是严格的历史时间序列百分位。
 *   股息率：越高越便宜 → pct = (now - low) / (high - low)
 *   PE / PB：越低越便宜 → pct = (high - now) / (high - low)
 */

export type ValuationLevel =
  | 'deep-undervalued'
  | 'undervalued'
  | 'fair'
  | 'slightly-high'
  | 'overvalued'

export interface Valuation {
  /** 便宜度(0~100，展示用四舍五入)，越高越便宜 */
  percentile: number
  level: ValuationLevel
  /** 估值标签，如“显著低估” */
  label: string
  /** 加仓建议 */
  advice: string
  /** 1~5 星，星越多越值得加仓 */
  score: number
  /** 是否值得加仓 */
  worthBuying: boolean
  /** UI 徽章样式 */
  tone: 'buy-strong' | 'buy' | 'hold' | 'watch' | 'avoid'
}

/** 按便宜度分档；入参使用未取整的分位，避免 69.6→70 跳档。 */
function levelFromPercentile(clamped: number): Omit<Valuation, 'percentile'> {
  if (clamped >= 70) {
    return {
      level: 'deep-undervalued',
      label: '显著低估',
      advice: '股息率处于区间高位，性价比突出，强烈建议逢低加仓 / 定投。',
      score: 5,
      worthBuying: true,
      tone: 'buy-strong',
    }
  }
  if (clamped >= 55) {
    return {
      level: 'undervalued',
      label: '低估',
      advice: '估值偏低，股债利差可观，适合分批建仓 / 加仓。',
      score: 4,
      worthBuying: true,
      tone: 'buy',
    }
  }
  if (clamped >= 45) {
    return {
      level: 'fair',
      label: '合理',
      advice: '估值中性，建议持有并坚持定投，暂不急于重仓加仓。',
      score: 3,
      worthBuying: false,
      tone: 'hold',
    }
  }
  if (clamped >= 30) {
    return {
      level: 'slightly-high',
      label: '略偏高',
      advice: '股息率偏低，性价比一般，建议观望，等待更好的买点。',
      score: 2,
      worthBuying: false,
      tone: 'watch',
    }
  }
  return {
    level: 'overvalued',
    label: '高估',
    advice: '股息率处于区间低位，加仓性价比差，谨慎追高。',
    score: 1,
    worthBuying: false,
    tone: 'avoid',
  }
}

export function valuate(
  yieldNow: number,
  yieldLow: number,
  yieldHigh: number,
): Valuation {
  const span = Math.max(yieldHigh - yieldLow, 0.0001)
  const raw = ((yieldNow - yieldLow) / span) * 100
  const clamped = Math.min(100, Math.max(0, raw))
  return {
    ...levelFromPercentile(clamped),
    percentile: Math.round(clamped),
  }
}

/**
 * 多因子估值。
 *
 * 综合分位 = wY×股息率 + wPB×PB + wPE×PE。
 * 默认权重 50/30/20；当股息率为实时而 PE/PB 仍为静态时，降权 PE/PB（70/20/10），
 * 避免混用不同新鲜度的因子把评级拉偏。
 */
export const FACTOR_WEIGHTS = { yield: 0.5, pb: 0.3, pe: 0.2 } as const
/** 股息率实时、PE/PB 静态时的权重。 */
export const FACTOR_WEIGHTS_YIELD_LIVE = { yield: 0.7, pb: 0.2, pe: 0.1 } as const

export interface FactorBreakdown {
  /** 股息率便宜度(0~100) */
  yield: number
  /** PE 便宜度(0~100) */
  pe: number
  /** PB 便宜度(0~100) */
  pb: number
}

export interface MultiValuation extends Valuation {
  /** 各因子便宜度 */
  factors: FactorBreakdown
  /** 是否因股息率实时 / PE·PB 静态而调整了权重 */
  weightsAdjusted: boolean
}

/** “越高越便宜”型区间位置(股息率)。 */
function pctHigherCheaper(now: number, low: number, high: number): number {
  const span = Math.max(high - low, 0.0001)
  return Math.min(100, Math.max(0, ((now - low) / span) * 100))
}

/** “越低越便宜”型区间位置(PE / PB)。 */
function pctLowerCheaper(now: number, low: number, high: number): number {
  const span = Math.max(high - low, 0.0001)
  return Math.min(100, Math.max(0, ((high - now) / span) * 100))
}

export interface MultiValuationInput {
  dividendYield: number
  yieldLow: number
  yieldHigh: number
  pe: number
  peLow: number
  peHigh: number
  pb: number
  pbLow: number
  pbHigh: number
  /**
   * 股息率是否来自实时指数接口。
   * true 时 PE/PB 通常仍为静态维护值，将提高股息率权重。
   */
  yieldLive?: boolean
}

/**
 * 综合股息率 / PE / PB 三因子给出估值评级。
 * 分档使用未取整的综合便宜度，展示 percentile 再四舍五入。
 */
export function valuateMulti(input: MultiValuationInput): MultiValuation {
  const factorsRaw: FactorBreakdown = {
    yield: pctHigherCheaper(
      input.dividendYield,
      input.yieldLow,
      input.yieldHigh,
    ),
    pe: pctLowerCheaper(input.pe, input.peLow, input.peHigh),
    pb: pctLowerCheaper(input.pb, input.pbLow, input.pbHigh),
  }
  const weightsAdjusted = Boolean(input.yieldLive)
  const weights = weightsAdjusted ? FACTOR_WEIGHTS_YIELD_LIVE : FACTOR_WEIGHTS
  const composite =
    factorsRaw.yield * weights.yield +
    factorsRaw.pb * weights.pb +
    factorsRaw.pe * weights.pe
  const clamped = Math.min(100, Math.max(0, composite))

  return {
    ...levelFromPercentile(clamped),
    percentile: Math.round(clamped),
    factors: {
      yield: Math.round(factorsRaw.yield),
      pe: Math.round(factorsRaw.pe),
      pb: Math.round(factorsRaw.pb),
    },
    weightsAdjusted,
  }
}

/**
 * 十年期国债收益率回退值(%)。
 * 优先使用 server/bond-yield 的实时抓取；抓取失败时用此常量。
 */
export const BOND_YIELD_10Y_FALLBACK = 1.78

/** @deprecated 使用 BOND_YIELD_10Y_FALLBACK 或实时 getBondYield10Y */
export const BOND_YIELD_10Y = BOND_YIELD_10Y_FALLBACK

/** 股债利差 = 股息率 - 十年国债收益率，越大越有配置价值。 */
export function equityBondSpread(
  dividendYield: number,
  bondYield: number = BOND_YIELD_10Y_FALLBACK,
): number {
  return Number((dividendYield - bondYield).toFixed(2))
}

/**
 * ETF「指数股息率 → 估算到手被动收入」折扣。
 * 覆盖管理费、分红政策差异、现金拖累等；个股不适用。
 */
export const ETF_INCOME_HAIRCUT = 0.85

/** 将展示用股息率转为估算被动收入用的有效股息率。 */
export function effectiveIncomeYield(
  dividendYield: number,
  kind: 'etf' | 'bank' | 'cyclical',
): number {
  return kind === 'etf' ? dividendYield * ETF_INCOME_HAIRCUT : dividendYield
}
