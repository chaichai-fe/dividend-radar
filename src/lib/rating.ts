/**
 * 红利 ETF 估值评级。
 *
 * 方法论（透明、可解释）：
 * 以“当前股息率在该指数多年股息率区间中的位置”作为低估程度分位。
 * 股息率越高 → 价格相对越便宜 → 越低估 → 越值得加仓。
 *   percentile = (yieldNow - yieldLow) / (yieldHigh - yieldLow)  → 0~100%
 * 再结合分位映射到 5 档评级与加仓建议。
 */

export type ValuationLevel =
  'deep-undervalued' | 'undervalued' | 'fair' | 'slightly-high' | 'overvalued'

export interface Valuation {
  /** 低估程度分位(0~100)，越高越便宜 */
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

export function valuate(
  yieldNow: number,
  yieldLow: number,
  yieldHigh: number,
): Valuation {
  const span = Math.max(yieldHigh - yieldLow, 0.0001)
  const raw = ((yieldNow - yieldLow) / span) * 100
  const percentile = Math.round(Math.min(100, Math.max(0, raw)))

  if (percentile >= 70) {
    return {
      percentile,
      level: 'deep-undervalued',
      label: '显著低估',
      advice: '股息率处于历史高位，性价比突出，强烈建议逢低加仓 / 定投。',
      score: 5,
      worthBuying: true,
      tone: 'buy-strong',
    }
  }
  if (percentile >= 55) {
    return {
      percentile,
      level: 'undervalued',
      label: '低估',
      advice: '估值偏低，股债利差可观，适合分批建仓 / 加仓。',
      score: 4,
      worthBuying: true,
      tone: 'buy',
    }
  }
  if (percentile >= 45) {
    return {
      percentile,
      level: 'fair',
      label: '合理',
      advice: '估值中性，建议持有并坚持定投，暂不急于重仓加仓。',
      score: 3,
      worthBuying: false,
      tone: 'hold',
    }
  }
  if (percentile >= 30) {
    return {
      percentile,
      level: 'slightly-high',
      label: '略偏高',
      advice: '股息率偏低，性价比一般，建议观望，等待更好的买点。',
      score: 2,
      worthBuying: false,
      tone: 'watch',
    }
  }
  return {
    percentile,
    level: 'overvalued',
    label: '高估',
    advice: '股息率处于历史低位，加仓性价比差，谨慎追高。',
    score: 1,
    worthBuying: false,
    tone: 'avoid',
  }
}

/**
 * 多因子估值。
 *
 * 在“股息率分位”之外，再叠加 PE、PB 两个便宜度分位，做加权综合：
 *  - 股息率：越高越便宜 → pct = (now - low) / (high - low)
 *  - PE / PB：越低越便宜 → pct = (high - now) / (high - low)
 * 综合分位 = 0.5×股息率 + 0.3×PB + 0.2×PE。
 * 红利指数多为金融/周期/重资产，PB 比 PE 更有参考意义，故 PB 权重高于 PE。
 */
export const FACTOR_WEIGHTS = { yield: 0.5, pb: 0.3, pe: 0.2 } as const

export interface FactorBreakdown {
  /** 股息率便宜度分位(0~100) */
  yield: number
  /** PE 便宜度分位(0~100) */
  pe: number
  /** PB 便宜度分位(0~100) */
  pb: number
}

export interface MultiValuation extends Valuation {
  /** 各因子便宜度分位 */
  factors: FactorBreakdown
}

/** “越高越便宜”型分位(股息率)。 */
function pctHigherCheaper(now: number, low: number, high: number): number {
  const span = Math.max(high - low, 0.0001)
  return Math.min(100, Math.max(0, ((now - low) / span) * 100))
}

/** “越低越便宜”型分位(PE / PB)。 */
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
}

/**
 * 综合股息率 / PE / PB 三因子给出估值评级。
 * 复用 `valuate` 的分档与文案（以综合便宜度分位作为等效“股息率分位”）。
 */
export function valuateMulti(input: MultiValuationInput): MultiValuation {
  const factors: FactorBreakdown = {
    yield: pctHigherCheaper(input.dividendYield, input.yieldLow, input.yieldHigh),
    pe: pctLowerCheaper(input.pe, input.peLow, input.peHigh),
    pb: pctLowerCheaper(input.pb, input.pbLow, input.pbHigh),
  }
  const composite =
    factors.yield * FACTOR_WEIGHTS.yield +
    factors.pb * FACTOR_WEIGHTS.pb +
    factors.pe * FACTOR_WEIGHTS.pe

  // 以综合分位映射到统一的 5 档评级：借助 valuate 的分档逻辑，
  // 传入 (composite, 0, 100) 使其内部 percentile === 综合分位。
  const base = valuate(composite, 0, 100)
  return {
    ...base,
    factors: {
      yield: Math.round(factors.yield),
      pe: Math.round(factors.pe),
      pb: Math.round(factors.pb),
    },
  }
}

/** 十年期国债收益率参考值(%)，用于展示股债利差。 */
export const BOND_YIELD_10Y = 1.78

/** 股债利差 = 股息率 - 十年国债收益率，越大越有配置价值。 */
export function equityBondSpread(dividendYield: number): number {
  return Number((dividendYield - BOND_YIELD_10Y).toFixed(2))
}
