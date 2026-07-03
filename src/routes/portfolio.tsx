import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  PiggyBank,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'

import { listEtfs } from '#/server/etfs'
import { listBanks } from '#/server/banks'
import {
  addHolding,
  listHoldings,
  removeHolding,
  setHoldingAmount,
} from '#/server/portfolio'
import { valuateMulti } from '#/lib/rating'
import type { MultiValuation } from '#/lib/rating'
import { DIVIDENDS, DIVIDEND_DATA_DATE } from '#/lib/dividend-data'
import { RatingBadge } from '#/components/rating-badge'
import { TrendChart } from '#/components/trend-chart'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'

function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime()
  const b = new Date(`${to}T00:00:00`).getTime()
  return Math.round((b - a) / 86_400_000)
}

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
  // SSR 预取持仓相关主体数据，首屏直接水合。
  loader: async ({ context }) => {
    const qc = context.queryClient
    await Promise.all([
      qc.ensureQueryData({ queryKey: ['etfs'], queryFn: () => listEtfs() }),
      qc.ensureQueryData({ queryKey: ['banks'], queryFn: () => listBanks() }),
      qc.ensureQueryData({
        queryKey: ['holdings'],
        queryFn: () => listHoldings(),
      }),
    ])
  },
})

const DEFAULT_SHARES = 1000

/** 组合内统一的标的模型：红利 ETF 与银行股一视同仁。 */
interface Instrument {
  code: string
  name: string
  kind: 'etf' | 'bank'
  /** 副标题：ETF 显示跟踪指数，银行显示分类 */
  subtitle: string
  /** 现价 / 净值 */
  price: number
  /** 股息率(%) */
  dividendYield: number
  /** 分红频率描述 */
  freq: string
  /** 搜索用小写文本 */
  searchText: string
  /** ETF 估值评级；银行为 null */
  valuation: MultiValuation | null
}

function PortfolioPage() {
  const queryClient = useQueryClient()
  const etfQuery = useQuery({
    queryKey: ['etfs'],
    queryFn: () => listEtfs(),
  })
  const banksQuery = useQuery({
    queryKey: ['banks'],
    queryFn: () => listBanks(),
  })
  const holdingsQuery = useQuery({
    queryKey: ['holdings'],
    queryFn: () => listHoldings(),
  })

  const etfs = etfQuery.data?.rows ?? []
  const banks = banksQuery.data?.rows ?? []
  const holdings = holdingsQuery.data ?? []

  // 统一 ETF 与银行为同一套 Instrument，组合内不再区分。
  const instrumentMap = useMemo(() => {
    const m = new Map<string, Instrument>()
    etfs.forEach((e) =>
      m.set(e.code, {
        code: e.code,
        name: e.name,
        kind: 'etf',
        subtitle: e.indexName,
        price: e.nav,
        dividendYield: e.dividendYield,
        freq: e.dividendFreq,
        searchText:
          `${e.name}${e.code}${e.indexName}${e.manager}`.toLowerCase(),
        valuation: valuateMulti(e),
      }),
    )
    banks.forEach((b) =>
      m.set(b.code, {
        code: b.code,
        name: b.name,
        kind: 'bank',
        subtitle: b.category,
        price: b.price,
        dividendYield: b.dividendYield,
        freq: '年度',
        searchText: `${b.name}${b.code}${b.category}`.toLowerCase(),
        valuation: null,
      }),
    )
    return m
  }, [etfs, banks])

  const allInstruments = useMemo(
    () => [...instrumentMap.values()],
    [instrumentMap],
  )

  const [keyword, setKeyword] = useState('')
  // 表格内金额编辑草稿：失焦时才写库，避免频繁请求
  const [draft, setDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    setDraft(
      Object.fromEntries(holdings.map((h) => [h.code, String(h.amount)])),
    )
  }, [holdings])

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ['holdings'] })
  }

  const [refreshing, setRefreshing] = useState(false)
  async function refresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['etfs'] }),
        queryClient.invalidateQueries({ queryKey: ['banks'] }),
        queryClient.invalidateQueries({ queryKey: ['holdings'] }),
      ])
      toast.success('已刷新最新行情')
    } catch {
      toast.error('刷新失败，请重试')
    } finally {
      setRefreshing(false)
    }
  }

  const addMutation = useMutation({
    mutationFn: (code: string) =>
      addHolding({ data: { code, amount: DEFAULT_SHARES } }),
    onSuccess: (_r, code) => {
      invalidate()
      toast.success(`已添加 ${instrumentMap.get(code)?.name ?? code}`)
      setKeyword('')
    },
    onError: () => toast.error('添加失败，请重试'),
  })

  const amountMutation = useMutation({
    mutationFn: (v: { code: string; amount: number }) =>
      setHoldingAmount({ data: v }),
    onSuccess: () => invalidate(),
    onError: () => toast.error('保存失败，请重试'),
  })

  const removeMutation = useMutation({
    mutationFn: (code: string) => removeHolding({ data: { code } }),
    onSuccess: () => invalidate(),
    onError: () => toast.error('移除失败，请重试'),
  })

  function add(code: string) {
    if (holdings.some((h) => h.code === code)) {
      toast.info('该 ETF 已在组合中')
      return
    }
    addMutation.mutate(code)
  }

  function commitAmount(code: string) {
    const value = Number(draft[code])
    const current = holdings.find((h) => h.code === code)?.amount
    if (!Number.isFinite(value) || value < 0) return
    if (current === value) return
    amountMutation.mutate({ code, amount: value })
  }

  const rows = useMemo(() => {
    return holdings
      .map((h) => {
        const inst = instrumentMap.get(h.code)
        if (!inst) return null
        // h.amount 表示持有份数/股数，市值 = 数量 × 现价
        const marketValue = h.amount * inst.price
        const annualIncome = marketValue * (inst.dividendYield / 100)
        return {
          holding: h,
          inst,
          marketValue,
          annualIncome,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [holdings, instrumentMap])

  const totalAmount = rows.reduce((s, r) => s + r.marketValue, 0)
  const totalIncome = rows.reduce((s, r) => s + r.annualIncome, 0)
  const portfolioYield = totalAmount > 0 ? (totalIncome / totalAmount) * 100 : 0

  // 持仓分红日历：只展示当前组合内 ETF 的分红安排
  const today = todayStr()
  const dividendEvents = useMemo(() => {
    const held = new Map(holdings.map((h) => [h.code, h.amount]))
    return DIVIDENDS.filter((ev) => held.has(ev.code))
      .map((ev) => {
        const inst = instrumentMap.get(ev.code)
        const shares = held.get(ev.code) ?? 0
        return {
          ev,
          name: inst?.name ?? ev.code,
          freq: inst?.freq ?? '—',
          singleYield:
            inst && inst.price > 0 ? (ev.perShare / inst.price) * 100 : 0,
          payout: shares * ev.perShare,
          daysToEx: daysBetween(today, ev.exDate),
        }
      })
  }, [holdings, instrumentMap, today])

  const upcomingDividends = useMemo(
    () =>
      dividendEvents
        .filter((r) => r.ev.exDate >= today)
        .sort((a, b) => a.ev.exDate.localeCompare(b.ev.exDate)),
    [dividendEvents, today],
  )
  const pastDividends = useMemo(
    () =>
      dividendEvents
        .filter((r) => r.ev.exDate < today)
        .sort((a, b) => b.ev.exDate.localeCompare(a.ev.exDate))
        .slice(0, 6),
    [dividendEvents, today],
  )
  const upcomingPayout = upcomingDividends.reduce((s, r) => s + r.payout, 0)

  // 资产预测(定投测算)输入
  const [initial, setInitial] = useState('0')
  const [monthly, setMonthly] = useState('6000')
  const [years, setYears] = useState('10')
  const [growth, setGrowth] = useState('3')
  const [swing, setSwing] = useState('3')
  const [reinvest, setReinvest] = useState(true)
  const [taxRate, setTaxRate] = useState(0)
  const [inflationOn, setInflationOn] = useState(false)
  const [inflation, setInflation] = useState('2')
  // 股息率留空时自动取组合加权股息率(无持仓则用 5% 作为默认假设)
  const [divYieldDraft, setDivYieldDraft] = useState('')
  const autoYield = portfolioYield > 0 ? portfolioYield : 5
  const effectiveYield =
    divYieldDraft.trim() !== '' ? Math.max(0, Number(divYieldDraft) || 0) : autoYield

  const projection = useMemo(() => {
    const init = Math.max(0, Number(initial) || 0)
    const m = Math.max(0, Number(monthly) || 0)
    const yrs = Math.max(1, Math.min(50, Math.round(Number(years) || 0)))
    const y = effectiveYield / 100
    const taxFactor = 1 - taxRate / 100
    const inflRate = inflationOn ? (Number(inflation) || 0) / 100 : 0
    const gNeutral = (Number(growth) || 0) / 100
    const spr = Math.max(0, Number(swing) || 0) / 100

    function sim(g: number) {
      let assets = init
      let cumNet = 0
      const points: Array<{ label: string; value: number }> = []
      for (let mo = 1; mo <= yrs * 12; mo++) {
        assets += m
        const gross = (assets * y) / 12
        const net = gross * taxFactor
        // 按到手时点折算为今日购买力(通胀关闭时 deflator=1)
        cumNet += net / Math.pow(1 + inflRate, mo / 12)
        assets *= 1 + g / 12
        if (reinvest) assets += net
        if (mo % 12 === 0) {
          const yr = mo / 12
          points.push({ label: `${yr}`, value: assets / Math.pow(1 + inflRate, yr) })
        }
      }
      const endDeflator = Math.pow(1 + inflRate, yrs)
      return {
        finalAssets: assets / endDeflator,
        finalAnnualDividend: (assets * y * taxFactor) / endDeflator,
        cumulativeDividends: cumNet,
        points,
      }
    }

    const neutral = sim(gNeutral)
    const optimistic = sim(gNeutral + spr)
    const pessimistic = sim(gNeutral - spr)
    const invested = init + m * 12 * yrs
    return {
      invested,
      neutral,
      optimistic,
      pessimistic,
      gain: neutral.finalAssets - invested,
      yrs,
      real: inflRate > 0,
    }
  }, [
    initial,
    monthly,
    years,
    growth,
    swing,
    effectiveYield,
    reinvest,
    taxRate,
    inflationOn,
    inflation,
  ])

  const searchResults = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return []
    return allInstruments
      .filter((i) => !holdings.some((h) => h.code === i.code))
      .filter((i) => i.searchText.includes(kw))
      .slice(0, 8)
  }, [keyword, allInstruments, holdings])

  return (
    <div className="rise-in space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="island-kicker">Portfolio</p>
          <h1 className="display-title mt-1 text-3xl font-bold text-foreground">
            我的持仓组合
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            搜索并添加 ETF，填写持有份数，自动按现价测算组合市值、加权股息率与预计年被动收入。数据保存在
            Cloudflare D1 数据库。
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="shrink-0"
        >
          <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
          刷新
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Wallet}
          label="组合市值"
          value={`¥${Math.round(totalAmount).toLocaleString()}`}
        />
        <SummaryCard
          icon={PiggyBank}
          label="组合加权股息率"
          value={`${portfolioYield.toFixed(2)}%`}
          accent
        />
        <SummaryCard
          icon={PiggyBank}
          label="预计年被动收入"
          value={`¥${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          accent
        />
        <SummaryCard
          icon={PiggyBank}
          label="预计月均被动收入"
          value={`¥${(totalIncome / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
      </div>

      <div className="island-shell rounded-2xl p-5">
        <label className="text-sm font-medium text-foreground">
          添加 ETF
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="输入名称 / 代码，如 中证红利、510880、招商银行"
            className="pl-9"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-3 divide-y divide-border rounded-xl border border-border">
            {searchResults.map((inst) => (
              <div
                key={inst.code}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {inst.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {inst.code} · {inst.subtitle}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    股息率 {inst.dividendYield.toFixed(2)}%
                    {inst.valuation ? (
                      <RatingBadge valuation={inst.valuation} />
                    ) : (
                      <KindTag kind={inst.kind} />
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => add(inst.code)}
                  disabled={addMutation.isPending}
                >
                  <Plus className="size-4" />
                  添加
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {holdingsQuery.isLoading ? (
        <div className="island-shell rounded-2xl py-16 text-center text-sm text-muted-foreground">
          加载组合中…
        </div>
      ) : rows.length === 0 ? (
        <div className="island-shell flex flex-col items-center justify-center gap-2 rounded-2xl py-16 text-center">
          <Wallet className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            组合还是空的，先在上方搜索并添加 ETF 吧。
          </p>
        </div>
      ) : (
        <div className="island-shell overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">ETF</th>
                  <th className="px-4 py-3 font-medium">现价</th>
                  <th className="px-4 py-3 font-medium">股息率</th>
                  <th className="px-4 py-3 font-medium">评级</th>
                  <th className="px-4 py-3 font-medium">持有数量(份/股)</th>
                  <th className="px-4 py-3 font-medium">市值(元)</th>
                  <th className="px-4 py-3 font-medium">占比</th>
                  <th className="px-4 py-3 font-medium">预计年分红</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(
                  ({ holding, inst, marketValue, annualIncome }) => (
                    <tr
                      key={inst.code}
                      className="border-b border-border/60 hover:bg-accent/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          {inst.name}
                          <KindTag kind={inst.kind} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inst.code} · {inst.subtitle}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {inst.price.toFixed(inst.kind === 'etf' ? 3 : 2)}
                      </td>
                      <td className="px-4 py-3 font-semibold tabular-nums text-foreground">
                        {inst.dividendYield.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3">
                        {inst.valuation ? (
                          <RatingBadge valuation={inst.valuation} />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={draft[inst.code] ?? String(holding.amount)}
                          min={0}
                          step={100}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [inst.code]: e.target.value,
                            }))
                          }
                          onBlur={() => commitAmount(inst.code)}
                          className="h-8 w-28 tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-3 tabular-nums text-foreground">
                        ¥
                        {marketValue.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {totalAmount > 0
                          ? ((marketValue / totalAmount) * 100).toFixed(1)
                          : '0.0'}
                        %
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                        ¥
                        {annualIncome.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMutation.mutate(inst.code)}
                        title="移除"
                      >
                        <Trash2 className="size-4 text-rose-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/40 font-semibold">
                  <td className="px-4 py-3 text-foreground">合计</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {portfolioYield.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    ¥
                    {totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">100%</td>
                  <td className="px-4 py-3 tabular-nums text-emerald-600 dark:text-emerald-400">
                    ¥
                    {totalIncome.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="island-shell rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-[var(--lagoon-deep)]" />
              <h2 className="font-semibold text-foreground">持仓分红日历</h2>
            </div>
            {upcomingPayout > 0 && (
              <span className="text-xs text-muted-foreground">
                未来预计到手（税前）
                <span className="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  ¥{Math.round(upcomingPayout).toLocaleString()}
                </span>
              </span>
            )}
          </div>

          {dividendEvents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              当前持仓暂无分红安排数据。分红数据每季度前后更新。
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {upcomingDividends.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    即将分红
                  </div>
                  {upcomingDividends.map((r) => (
                    <DividendLine
                      key={`${r.ev.code}-${r.ev.exDate}`}
                      name={r.name}
                      code={r.ev.code}
                      freq={r.freq}
                      exDate={r.ev.exDate}
                      recordDate={r.ev.recordDate}
                      perShare={r.ev.perShare}
                      singleYield={r.singleYield}
                      payout={r.payout}
                      daysToEx={r.daysToEx}
                      estimated={r.ev.estimated}
                    />
                  ))}
                </div>
              )}

              {pastDividends.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    近期已分红
                  </div>
                  {pastDividends.map((r) => (
                    <DividendLine
                      key={`${r.ev.code}-${r.ev.exDate}`}
                      name={r.name}
                      code={r.ev.code}
                      freq={r.freq}
                      exDate={r.ev.exDate}
                      recordDate={r.ev.recordDate}
                      perShare={r.ev.perShare}
                      singleYield={r.singleYield}
                      payout={r.payout}
                      past
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            红利税按持有期计征：≤1 个月 20%，1 个月–1 年 10%，超过 1 年免征；“到手”为税前金额。数据日期
            {' '}
            {DIVIDEND_DATA_DATE}，除息日晚于该日期者为预告（标“预”），以基金公告为准。
          </p>
        </div>
      )}

      <div className="island-shell rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-[var(--lagoon-deep)]" />
          <h2 className="font-semibold text-foreground">资产预测 · 定投测算</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          假设每月定投固定金额、按设定的年化涨幅与股息率复利增长，估算若干年后的总资产与被动收入。仅为理论测算，不代表未来收益。
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectionField
            label="初始资金(元)"
            value={initial}
            onChange={setInitial}
            step={10000}
            hint="起始一次性投入的本金"
          />
          <ProjectionField
            label="月定投金额(元)"
            value={monthly}
            onChange={setMonthly}
            step={500}
          />
          <ProjectionField
            label="投资年限(年)"
            value={years}
            onChange={setYears}
            step={1}
          />
          <ProjectionField
            label="预期年化涨幅(%)"
            value={growth}
            onChange={setGrowth}
            step={1}
            hint="中性情景的价格年化增长假设"
          />
          <ProjectionField
            label="情景波动(±%)"
            value={swing}
            onChange={setSwing}
            step={1}
            hint="乐观/悲观相对中性的涨幅偏移"
          />
          <ProjectionField
            label="股息率(%)"
            value={divYieldDraft}
            onChange={setDivYieldDraft}
            step={0.5}
            placeholder={autoYield.toFixed(2)}
            hint="留空默认取组合加权股息率"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={reinvest}
              onChange={(e) => setReinvest(e.target.checked)}
              className="size-4 accent-[var(--lagoon-deep)]"
            />
            分红再投入(复利滚存)
          </label>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">分红计税</span>
            <div className="flex gap-1">
              {(
                [
                  [0, '免税'],
                  [10, '10%'],
                  [20, '20%'],
                ] as Array<[number, string]>
              ).map(([rate, lbl]) => (
                <button
                  key={rate}
                  onClick={() => setTaxRate(rate)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition',
                    taxRate === rate
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={inflationOn}
              onChange={(e) => setInflationOn(e.target.checked)}
              className="size-4 accent-[var(--lagoon-deep)]"
            />
            按通胀折算购买力
          </label>
          {inflationOn && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              通胀率
              <Input
                type="number"
                value={inflation}
                min={0}
                step={0.5}
                onChange={(e) => setInflation(e.target.value)}
                className="h-8 w-20 tabular-nums"
              />
              %
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Wallet}
            label={`累计投入本金(${projection.yrs}年)`}
            value={`¥${Math.round(projection.invested).toLocaleString()}`}
          />
          <SummaryCard
            icon={TrendingUp}
            label={`第 ${projection.yrs} 年末总资产${projection.real ? ' · 今日购买力' : ''}`}
            value={`¥${Math.round(projection.neutral.finalAssets).toLocaleString()}`}
            accent
          />
          <SummaryCard
            icon={PiggyBank}
            label={`第 ${projection.yrs} 年度分红${taxRate > 0 ? '(税后)' : ''}`}
            value={`¥${Math.round(projection.neutral.finalAnnualDividend).toLocaleString()}`}
            accent
          />
          <SummaryCard
            icon={PiggyBank}
            label={`累计分红到手${taxRate > 0 ? '(税后)' : ''}`}
            value={`¥${Math.round(projection.neutral.cumulativeDividends).toLocaleString()}`}
          />
        </div>

        <div className="mt-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          期末总资产区间（{projection.yrs} 年后
          {projection.real ? ' · 今日购买力' : ''}）：
          <span className="ml-1 font-semibold text-rose-500">
            悲观 ¥{Math.round(projection.pessimistic.finalAssets).toLocaleString()}
          </span>
          <span className="mx-1">·</span>
          <span className="font-semibold text-foreground">
            中性 ¥{Math.round(projection.neutral.finalAssets).toLocaleString()}
          </span>
          <span className="mx-1">·</span>
          <span className="font-semibold text-emerald-500">
            乐观 ¥{Math.round(projection.optimistic.finalAssets).toLocaleString()}
          </span>
        </div>

        <div className="mt-4">
          <TrendChart
            data={projection.neutral.points}
            color="var(--lagoon-deep)"
            format={(v) => `¥${Math.round(v).toLocaleString()}`}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            曲线为中性情景（横轴年数）。中性期末 ¥
            {Math.round(projection.neutral.finalAssets).toLocaleString()}，含投入本金 ¥
            {Math.round(projection.invested).toLocaleString()}
            {!projection.real && (
              <>、增值收益 ¥{Math.round(projection.gain).toLocaleString()}</>
            )}
            。
            {projection.real && '（已按通胀折算为今日购买力）'}
            {taxRate > 0 && `分红按 ${taxRate}% 计税。`}
          </p>
        </div>
      </div>
    </div>
  )
}

function ProjectionField({
  label,
  value,
  onChange,
  step,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  step: number
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        type="number"
        value={value}
        min={0}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="tabular-nums"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function DividendLine({
  name,
  code,
  freq,
  exDate,
  recordDate,
  perShare,
  singleYield,
  payout,
  daysToEx,
  estimated,
  past,
}: {
  name: string
  code: string
  freq: string
  exDate: string
  recordDate: string
  perShare: number
  singleYield: number
  payout: number
  daysToEx?: number
  estimated?: boolean
  past?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">
          {name}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {code} · {freq}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          登记 {recordDate.slice(5)} · 除息 {exDate.slice(5)}
          {estimated && (
            <span className="ml-1 rounded bg-amber-500/15 px-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              预
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums text-foreground">
            {perShare.toFixed(3)} 元/份
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            单次 ≈ {singleYield.toFixed(2)}%
            {payout > 0 && (
              <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                · {past ? '到手' : '预计'} ¥
                {Math.round(payout).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        {!past && (
          <span
            className={cn(
              'w-16 shrink-0 rounded-full border px-2 py-0.5 text-center text-xs font-semibold',
              (daysToEx ?? 99) <= 7
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'border-border text-muted-foreground',
            )}
          >
            {daysToEx === 0 ? '今日' : `${daysToEx}天`}
          </span>
        )}
      </div>
    </div>
  )
}

function KindTag({ kind }: { kind: 'etf' | 'bank' }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
        kind === 'etf'
          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      )}
    >
      {kind === 'etf' ? 'ETF' : '银行'}
    </span>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="feature-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <p
        className={cn(
          'mt-2 text-2xl font-bold tabular-nums',
          accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  )
}
