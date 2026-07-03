import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { ArrowRight, Gauge, Landmark, Wallet } from 'lucide-react'

import { listEtfs } from '#/server/etfs'
import { listBanks } from '#/server/banks'
import { listHoldings } from '#/server/portfolio'
import { BOND_YIELD_10Y, valuateMulti } from '#/lib/rating'
import { rateBankYield } from '#/lib/bank-data'
import { RatingBadge } from '#/components/rating-badge'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/')({
  component: DashboardPage,
  // SSR 阶段预取主体数据并 dehydrate，客户端直接水合出内容、省掉一次往返，
  // 首屏不再从骨架屏起步。回撤等次要数据仍走客户端懒查询、不阻塞。
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

const bankToneClass: Record<
  ReturnType<typeof rateBankYield>['tone'],
  string
> = {
  'buy-strong':
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  buy: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  hold: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  watch:
    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  avoid: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
}

function DashboardPage() {
  const query = useQuery({
    queryKey: ['etfs'],
    queryFn: () => listEtfs(),
  })
  const rows = query.data?.rows ?? []

  const banksQuery = useQuery({
    queryKey: ['banks'],
    queryFn: () => listBanks(),
  })
  const bankRows = banksQuery.data?.rows ?? []

  const picks = useMemo(() => {
    return rows
      .map((etf) => ({
        etf,
        valuation: valuateMulti(etf),
      }))
      .filter((r) => r.valuation.worthBuying)
      .sort((a, b) => b.valuation.percentile - a.valuation.percentile)
      .slice(0, 4)
  }, [rows])

  const topBanks = useMemo(() => {
    return [...bankRows]
      .sort((a, b) => b.dividendYield - a.dividendYield)
      .slice(0, 6)
  }, [bankRows])

  const bankHighCount = bankRows.filter(
    (b) => rateBankYield(b.dividendYield).isHigh,
  ).length

  const holdingsQuery = useQuery({
    queryKey: ['holdings'],
    queryFn: () => listHoldings(),
  })
  const holdings = holdingsQuery.data ?? []

  const portfolio = useMemo(() => {
    const etfMap = new Map(rows.map((e) => [e.code, e]))
    let totalValue = 0
    let totalIncome = 0
    for (const h of holdings) {
      const etf = etfMap.get(h.code)
      if (!etf) continue
      // h.amount 表示持有份数，市值 = 份数 × 现价
      const marketValue = h.amount * etf.nav
      totalValue += marketValue
      totalIncome += marketValue * (etf.dividendYield / 100)
    }
    const yieldPct = totalValue > 0 ? (totalIncome / totalValue) * 100 : 0
    return { totalValue, totalIncome, yieldPct, count: holdings.length }
  }, [holdings, rows])

  const portfolioReady =
    holdingsQuery.isSuccess && query.isSuccess && portfolio.totalValue > 0

  const avgYield =
    rows.length > 0
      ? rows.reduce((s, e) => s + e.dividendYield, 0) / rows.length
      : 0
  const bankAvgYield =
    bankRows.length > 0
      ? bankRows.reduce((s, b) => s + b.dividendYield, 0) / bankRows.length
      : 0

  return (
    <div className="rise-in space-y-8">
      <div>
        <p className="island-kicker">Dividend Radar</p>
        <h1 className="display-title mt-1 text-3xl font-bold text-foreground sm:text-4xl">
          A 股红利 ETF 投资雷达
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          一站式汇总 A 股红利类 ETF 与高股息银行的净值、股息率，基于股息率历史分位做低估
          / 高估评级与加仓建议，并帮你管理组合、测算年被动收入。
        </p>
      </div>

      <Link
        to="/portfolio"
        className="group relative block overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-emerald-500/5 to-transparent p-6 shadow-[0_2px_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/15 transition hover:ring-emerald-500/30 sm:p-7"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Wallet className="size-5" />
              </span>
              <div>
                <p className="island-kicker text-emerald-600 dark:text-emerald-400">
                  My Portfolio
                </p>
                <h2 className="text-lg font-semibold text-foreground">
                  我的组合 · 年被动收入
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {portfolioReady ? (
                <>
                  组合股息率{' '}
                  <span className="font-semibold text-foreground">
                    {portfolio.yieldPct.toFixed(2)}%
                  </span>{' '}
                  · 市值 ¥{Math.round(portfolio.totalValue).toLocaleString()} ·{' '}
                  {portfolio.count} 只持仓
                </>
              ) : (
                '搜索添加 ETF，测算组合股息率与年被动收入'
              )}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              管理组合
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </div>
          <div className="shrink-0 sm:text-right">
            <div className="text-xs font-medium text-muted-foreground">
              预计年被动收入
            </div>
            <div className="mt-1 text-4xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-5xl">
              {portfolioReady
                ? `¥${Math.round(portfolio.totalIncome).toLocaleString()}`
                : holdingsQuery.isLoading
                  ? '—'
                  : '待添加'}
            </div>
            {portfolioReady && (
              <div className="mt-1 text-xs text-muted-foreground">
                月均 ≈ ¥
                {Math.round(portfolio.totalIncome / 12).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/etfs"
          className="feature-card group rounded-2xl border border-border p-6 transition"
        >
          <div className="flex items-start justify-between">
            <Gauge className="size-6 text-[var(--lagoon-deep)]" />
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {query.isLoading ? '—' : rows.length}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            红利 ETF 估值榜
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            净值、股息率、低估/高估评级与加仓建议
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--lagoon-deep)]">
            查看估值
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/banks"
          className="feature-card group rounded-2xl border border-border p-6 transition"
        >
          <div className="flex items-start justify-between">
            <Landmark className="size-6 text-[var(--lagoon-deep)]" />
            <span className="text-3xl font-bold tabular-nums text-emerald-500">
              {banksQuery.isLoading ? '—' : bankHighCount}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            高股息银行
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {banksQuery.isLoading
              ? '按实时股价测算银行股息率'
              : `${bankRows.length} 家银行，${bankHighCount} 家股息率 ≥ 5%`}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--lagoon-deep)]">
            查看银行
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <div className="feature-card rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between">
            <Gauge className="size-6 text-[var(--lagoon-deep)]" />
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {query.isLoading ? '—' : `${avgYield.toFixed(2)}%`}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            红利 ETF 平均股息率
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            对比十年国债 {BOND_YIELD_10Y}%，股债利差约 +
            {(avgYield - BOND_YIELD_10Y).toFixed(2)}%
          </p>
        </div>

        <div className="feature-card rounded-2xl border border-border p-6">
          <div className="flex items-start justify-between">
            <Landmark className="size-6 text-[var(--lagoon-deep)]" />
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {banksQuery.isLoading ? '—' : `${bankAvgYield.toFixed(2)}%`}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            银行平均股息率
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            对比十年国债 {BOND_YIELD_10Y}%，股债利差约 +
            {(bankAvgYield - BOND_YIELD_10Y).toFixed(2)}%
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="display-title text-xl font-bold text-foreground">
            当前值得关注 · 低估加仓榜
          </h2>
          <Link
            to="/etfs"
            className="text-sm font-medium text-[var(--lagoon-deep)]"
          >
            查看全部 →
          </Link>
        </div>

        {query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : picks.length === 0 ? (
          <div className="island-shell rounded-2xl p-6 text-sm text-muted-foreground">
            当前主流红利指数估值中性偏高，暂无“值得加仓”标的，建议保持定投、耐心等待更好买点。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {picks.map(({ etf, valuation }) => (
              <Link
                key={etf.code}
                to="/etfs"
                className="feature-card group rounded-2xl border border-border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-foreground">
                      {etf.name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {etf.code}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {etf.indexName} · {etf.manager}
                    </div>
                  </div>
                  <RatingBadge valuation={valuation} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">股息率</div>
                    <div className="text-2xl font-bold tabular-nums text-foreground">
                      {etf.dividendYield.toFixed(2)}%
                    </div>
                  </div>
                  <p className="max-w-[60%] text-right text-xs text-muted-foreground">
                    {valuation.advice}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="display-title text-xl font-bold text-foreground">
            高股息银行 · 股息率榜
          </h2>
          <Link
            to="/banks"
            className="text-sm font-medium text-[var(--lagoon-deep)]"
          >
            查看全部 →
          </Link>
        </div>

        {banksQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topBanks.map((bank) => {
              const rating = rateBankYield(bank.dividendYield)
              return (
                <Link
                  key={bank.code}
                  to="/banks"
                  className="feature-card group rounded-2xl border border-border p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-foreground">
                        {bank.name}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {bank.code}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {bank.category} · PB {bank.pb.toFixed(2)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                        bankToneClass[rating.tone],
                      )}
                    >
                      {rating.label}
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        股息率
                      </div>
                      <div className="text-2xl font-bold tabular-nums text-foreground">
                        {bank.dividendYield.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>现价 {bank.price.toFixed(2)}</div>
                      <div
                        title={
                          bank.dpsYear
                            ? `每股分红取 ${bank.dpsYear} 年度方案(含预案)，共 ${bank.dps.toFixed(3)} 元`
                            : '每股分红为参考值'
                        }
                      >
                        每股分红 {bank.dps.toFixed(2)}
                        {bank.dpsYear ? (
                          <span className="ml-1 text-[10px] text-muted-foreground/70">
                            {String(bank.dpsYear).slice(2)}年
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        评级方法：ETF
        以“股息率 + PB + PE 三因子在各自多年区间中的分位”加权衡量低估程度（权重
        50/30/20）；银行按“每股分红 ÷
        实时股价”动态测算股息率。越便宜越低估、越值得关注。
        本工具仅供学习研究，不构成投资建议。
      </p>
    </div>
  )
}
