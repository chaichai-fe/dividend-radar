import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ArrowUpDown, PlusCircle, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

import { listEtfs } from '#/server/etfs'
import type { EtfQuote } from '#/server/etfs'
import { equityBondSpread, valuateMulti } from '#/lib/rating'
import { addHolding } from '#/server/portfolio'
import { RatingBadge, ValuationBar } from '#/components/rating-badge'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn, daysSince } from '#/lib/utils.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export const Route = createFileRoute('/etfs')({
  component: EtfsPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ['etfs'],
      queryFn: () => listEtfs(),
    })
  },
})

type FilterKey = 'all' | 'buy' | 'undervalued' | 'fair' | 'watch'
type SortKey = 'valuation' | 'yield' | 'scale' | 'change'

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'buy', label: '值得加仓' },
  { key: 'undervalued', label: '低估' },
  { key: 'fair', label: '合理' },
  { key: 'watch', label: '偏高/观望' },
]

function EtfsPage() {
  const query = useQuery({
    queryKey: ['etfs'],
    queryFn: () => listEtfs(),
  })

  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('valuation')
  const [target, setTarget] = useState<EtfQuote | null>(null)

  const rows = query.data?.rows ?? []

  const enriched = useMemo(() => {
    return rows.map((etf) => ({
      etf,
      valuation: valuateMulti(etf),
      spread: equityBondSpread(etf.dividendYield),
    }))
  }, [rows])

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    let list = enriched.filter(({ etf, valuation }) => {
      if (kw) {
        const hay =
          `${etf.name}${etf.code}${etf.indexName}${etf.manager}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      if (filter === 'buy') return valuation.worthBuying
      if (filter === 'undervalued')
        return (
          valuation.level === 'undervalued' ||
          valuation.level === 'deep-undervalued'
        )
      if (filter === 'fair') return valuation.level === 'fair'
      if (filter === 'watch')
        return (
          valuation.level === 'slightly-high' ||
          valuation.level === 'overvalued'
        )
      return true
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'yield':
          return b.etf.dividendYield - a.etf.dividendYield
        case 'scale':
          return b.etf.scale - a.etf.scale
        case 'change':
          return b.etf.changePct - a.etf.changePct
        default:
          return b.valuation.percentile - a.valuation.percentile
      }
    })
    return list
  }, [enriched, keyword, filter, sort])

  const buyCount = enriched.filter((e) => e.valuation.worthBuying).length
  const avgYield =
    enriched.length > 0
      ? enriched.reduce((s, e) => s + e.etf.dividendYield, 0) / enriched.length
      : 0

  const dataDate = rows[0]?.dataDate
  const staleDays = dataDate ? daysSince(dataDate) : 0
  // 指数股息率/PE/PB 为静态维护，超过约 45 天视为可能偏旧，提示用户。
  const isStale = staleDays > 45

  return (
    <div className="rise-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker">Valuation</p>
          <h1 className="display-title mt-1 text-3xl font-bold text-foreground">
            红利 ETF 估值榜
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            汇总 A 股 {rows.length} 只主流红利 ETF
            的净值与股息率，按“股息率 + PB + PE 多因子历史分位”评级低估 /
            高估与加仓价值。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-xs text-muted-foreground">
            {query.data ? (
              <>
                <div>
                  实时净值 {query.data.liveCount}/{rows.length}
                </div>
                <div>
                  实时股息率 {query.data.yieldLiveCount}/{rows.length}
                </div>
                <div
                  title="股息率优先取跟踪指数的实时股息率，未覆盖的指数与 PE、PB、估值区间仍为静态维护数据。"
                  className={cn(
                    isStale && 'font-medium text-amber-600 dark:text-amber-400',
                  )}
                >
                  估值数据 {dataDate || '—'}
                  {dataDate && (
                    <span className="ml-1">
                      （{staleDays === 0 ? '今日' : `${staleDays}天前`}
                      {isStale ? ' · 偏旧' : ''}）
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div>加载中…</div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const id = toast.loading('正在刷新实时净值…')
              const res = await query.refetch()
              if (res.isError) {
                toast.error('刷新失败，请重试', { id })
              } else {
                toast.success('已刷新最新行情', { id })
              }
            }}
            disabled={query.isFetching}
          >
            <RefreshCw
              className={cn('size-4', query.isFetching && 'animate-spin')}
            />
            刷新
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="收录红利 ETF" value={`${rows.length}`} unit="只" />
        <StatCard label="当前值得加仓" value={`${buyCount}`} unit="只" accent />
        <StatCard label="平均股息率" value={avgYield.toFixed(2)} unit="%" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名称 / 代码 / 指数 / 基金公司"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                filter === f.key
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isStale && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          估值数据（股息率 / PE / PB / 估值区间）为指数层面静态维护，已更新于
          {' '}
          {staleDays} 天前（{dataDate}），可能与最新值存在偏差；净值与涨跌幅仍为实时。请以指数公司/基金公告为准。
        </div>
      )}

      <div className="island-shell overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">ETF / 跟踪指数</th>
                <SortableTh
                  label="现价"
                  active={sort === 'change'}
                  onClick={() => setSort('change')}
                />
                <SortableTh
                  label="股息率"
                  active={sort === 'yield'}
                  onClick={() => setSort('yield')}
                />
                <th className="px-4 py-3 font-medium">股债利差</th>
                <th className="px-4 py-3 font-medium">PE</th>
                <th className="px-4 py-3 font-medium">PB</th>
                <SortableTh
                  label="规模(亿)"
                  active={sort === 'scale'}
                  onClick={() => setSort('scale')}
                />
                <SortableTh
                  label="低估程度"
                  active={sort === 'valuation'}
                  onClick={() => setSort('valuation')}
                />
                <th className="px-4 py-3 font-medium">评级</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="px-4 py-3" colSpan={10}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {visible.map(({ etf, valuation, spread }) => (
                <tr
                  key={etf.code}
                  className="border-b border-border/60 transition hover:bg-accent/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {etf.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {etf.code} · {etf.indexName} · {etf.manager}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium tabular-nums text-foreground">
                      {etf.nav.toFixed(3)}
                    </div>
                    <div
                      className={cn(
                        'text-xs tabular-nums',
                        etf.changePct > 0
                          ? 'text-rose-500'
                          : etf.changePct < 0
                            ? 'text-emerald-500'
                            : 'text-muted-foreground',
                      )}
                    >
                      {etf.changePct > 0 ? '+' : ''}
                      {etf.changePct.toFixed(2)}%
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 font-semibold tabular-nums text-foreground"
                    title={`跟踪指数股息率（成份股加权，静态维护，截至 ${dataDate || '—'}），按实时净值折算；非基金实际分派率。`}
                  >
                    {etf.dividendYield.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    +{spread}%
                  </td>
                  <td
                    className="px-4 py-3 tabular-nums text-muted-foreground"
                    title={`指数 PE（静态，截至 ${dataDate || '—'}）`}
                  >
                    {etf.pe.toFixed(1)}
                  </td>
                  <td
                    className="px-4 py-3 tabular-nums text-muted-foreground"
                    title={`指数 PB（静态，截至 ${dataDate || '—'}）`}
                  >
                    {etf.pb.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {etf.scale.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <ValuationBar valuation={valuation} />
                  </td>
                  <td className="px-4 py-3">
                    <RatingBadge valuation={valuation} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTarget(etf)}
                    >
                      <PlusCircle className="size-4" />
                      加入
                    </Button>
                  </td>
                </tr>
              ))}

              {!query.isLoading && visible.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-muted-foreground"
                    colSpan={10}
                  >
                    没有匹配的红利 ETF
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        股息率为
        <span className="text-foreground">跟踪指数的成份股加权股息率</span>
        （静态维护，截至 {dataDate || '—'}），按实时净值折算，反映底层资产收益水平，
        并非基金实际分派率；PE / PB / 估值区间同为指数层面静态参考。仅净值与涨跌幅为实时数据。
        本工具仅供学习研究，不构成投资建议。
      </p>

      <AddDialog etf={target} onClose={() => setTarget(null)} />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: string
  unit: string
  accent?: boolean
}) {
  return (
    <div className="feature-card rounded-2xl border border-border p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
        {value}
        <span
          className={cn(
            'ml-1 text-base font-medium',
            accent ? 'text-emerald-500' : 'text-muted-foreground',
          )}
        >
          {unit}
        </span>
      </p>
    </div>
  )
}

function SortableTh({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 transition hover:text-foreground',
          active && 'text-foreground',
        )}
      >
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  )
}

function FactorRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-[var(--lagoon-deep)]"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right tabular-nums text-foreground">
        {value}%
      </span>
    </div>
  )
}

function AddDialog({
  etf,
  onClose,
}: {
  etf: EtfQuote | null
  onClose: () => void
}) {
  const [shares, setShares] = useState('1000')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  const valuation = etf ? valuateMulti(etf) : null

  async function confirm() {
    if (!etf) return
    const value = Number(shares)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('请输入有效的份数')
      return
    }
    setSaving(true)
    try {
      await addHolding({ data: { code: etf.code, amount: value } })
      await queryClient.invalidateQueries({ queryKey: ['holdings'] })
      toast.success(`已将 ${etf.name} 加入组合（${value.toLocaleString()} 份）`)
      onClose()
    } catch {
      toast.error('加入组合失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={Boolean(etf)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {etf && valuation && (
          <>
            <DialogHeader>
              <DialogTitle>
                加入组合 · {etf.name}（{etf.code}）
              </DialogTitle>
              <DialogDescription>
                跟踪 {etf.indexName}｜股息率 {etf.dividendYield.toFixed(2)}%｜
                <RatingBadge valuation={valuation} className="ml-1" />
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                {etf.indexDesc}
                <br />
                <span className="text-foreground">加仓建议：</span>
                {valuation.advice}
              </p>
              <div className="rounded-lg bg-muted/60 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-foreground">多因子便宜度分位</span>
                  <span className="text-muted-foreground">
                    综合 {valuation.percentile}% · 越高越低估
                  </span>
                </div>
                <div className="space-y-1.5">
                  <FactorRow label="股息率" value={valuation.factors.yield} />
                  <FactorRow label="PB" value={valuation.factors.pb} />
                  <FactorRow label="PE" value={valuation.factors.pe} />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  权重 股息率 50% · PB 30% · PE 20%。红利指数偏金融/周期，PB
                  比 PE 更具参考性。
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">买入份数（份）</label>
                <Input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  min={0}
                  step={100}
                />
                <p className="text-xs text-muted-foreground">
                  现价 {etf.nav.toFixed(3)} · 市值 ≈ ¥
                  {((Number(shares) || 0) * etf.nav).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                  ｜预计年分红 ≈ ¥
                  {(
                    (Number(shares) || 0) *
                    etf.nav *
                    (etf.dividendYield / 100)
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                取消
              </Button>
              <Button onClick={confirm} disabled={saving}>
                {saving ? '加入中…' : '确认加入'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
