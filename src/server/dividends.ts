/**
 * 分红抓取工具：从东方财富「分红送配」数据中心批量抓取历年分红明细，
 * 并按统一口径算出每股税前现金分红(dps)，用 Cloudflare Cache API 做边缘缓存。
 *
 * 口径说明：前瞻口径 —— 取「最新已公告年度」的每股现金分红合计(含中期)。
 *   - 「已公告」= 该会计年度的年报(12-31)分红方案已发布(含预案/董事会或股东大会通过)，
 *     无需等到实施分配，从而第一时间反映最新一次分红的上调或下调；
 *   - 「合计(含中期)」= 该会计年度的中期(06-30)与年末(12-31)分红相加。
 * 例：北京银行最新已公告年度为 2025 年(预案 0.278 元/股，2025 无中期)，故 dps=0.278，
 *     与东方财富等前瞻口径一致；等更新年度预案发布后自动切换，无需人工维护。
 * 反映的是「以现价买入，未来一年预期可获得的每股分红」。
 *
 * 分红一年只变动数次，故缓存周期较长(默认 12h)。抓取失败时返回空表，
 * 由调用方回退到种子值(bank-data 中的 dps)。
 */

import { readEdgeCache, writeEdgeCache } from '#/server/quotes'

export interface DividendInfo {
  /** 每股税前现金分红(元/股) */
  dps: number
  /** 该 dps 对应的会计年度(如 2024) */
  fiscalYear: number
}

interface ShareBonusRow {
  SECURITY_CODE: string
  REPORT_DATE: string | null
  PRETAX_BONUS_RMB: number | null
  ASSIGN_PROGRESS: string | null
}

const EM_HEADERS = {
  Referer: 'https://data.eastmoney.com/',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

/** 由分红明细行按前瞻口径算出每只标的的 dps。 */
function reduceDividends(rows: Array<ShareBonusRow>): Map<string, DividendInfo> {
  // code → year → 该会计年度已公告的每股分红合计(含中期+年末)
  const byCodeYear = new Map<string, Map<number, number>>()
  // code → 已公告「年报(12-31)」分红的最新会计年度
  const latestAnnualYear = new Map<string, number>()

  for (const row of rows) {
    const code = row.SECURITY_CODE
    const reportDate = row.REPORT_DATE
    const per10 = row.PRETAX_BONUS_RMB
    // 前瞻口径：含预案，只要方案已公告(有派息金额)即计入，不要求已实施。
    if (!code || !reportDate || per10 == null || !Number.isFinite(per10) || per10 <= 0)
      continue

    const year = Number(reportDate.slice(0, 4))
    const isYearEnd = reportDate.slice(5, 10) === '12-31'
    if (!Number.isFinite(year)) continue

    const perShare = per10 / 10
    const yearMap = byCodeYear.get(code) ?? new Map<number, number>()
    yearMap.set(year, (yearMap.get(year) ?? 0) + perShare)
    byCodeYear.set(code, yearMap)

    // 该会计年度的“年报分红”已公告(哪怕仅预案)，即视为最新完整年度锚点，
    // 避免用单独一笔中期分红去年化。
    if (isYearEnd) {
      latestAnnualYear.set(code, Math.max(latestAnnualYear.get(code) ?? 0, year))
    }
  }

  const result = new Map<string, DividendInfo>()
  for (const [code, year] of latestAnnualYear) {
    const dps = byCodeYear.get(code)?.get(year)
    if (dps != null && dps > 0) {
      result.set(code, { dps, fiscalYear: year })
    }
  }
  return result
}

/**
 * 批量抓取一组标的的每股分红(dps)，带边缘缓存。
 * @param codes 6 位证券代码数组，如 ['601169','000001']
 * @param cacheName 缓存区分名(如 'banks')
 * @param ttl 缓存秒数，默认 12h
 */
export async function fetchDividends(
  codes: Array<string>,
  cacheName: string,
  ttl = 60 * 60 * 12,
): Promise<Map<string, DividendInfo>> {
  if (codes.length === 0) return new Map()

  const cacheKey = new Request(`https://dividends.internal/${cacheName}`)

  const cached = await readEdgeCache(cacheKey)
  if (cached != null) {
    try {
      return reduceDividends(JSON.parse(cached) as Array<ShareBonusRow>)
    } catch {
      // 缓存损坏则重新抓取
    }
  }

  const inClause = codes.map((c) => `"${c}"`).join(',')
  const params = new URLSearchParams({
    reportName: 'RPT_SHAREBONUS_DET',
    columns: 'SECURITY_CODE,REPORT_DATE,PRETAX_BONUS_RMB,ASSIGN_PROGRESS',
    filter: `(SECURITY_CODE in (${inClause}))`,
    pageNumber: '1',
    pageSize: '1000',
    sortColumns: 'REPORT_DATE',
    sortTypes: '-1',
  })

  try {
    const res = await fetch(
      `https://datacenter-web.eastmoney.com/api/data/v1/get?${params}`,
      { headers: EM_HEADERS, signal: AbortSignal.timeout(6000) },
    )
    if (!res.ok) return new Map()
    const json: {
      success?: boolean
      result?: { data?: Array<ShareBonusRow> }
    } = await res.json()
    const data = json.result?.data
    if (!json.success || !Array.isArray(data)) return new Map()
    await writeEdgeCache(cacheKey, JSON.stringify(data), ttl)
    return reduceDividends(data)
  } catch {
    // 网络失败：返回空表，由调用方回退到种子数据
    return new Map()
  }
}
