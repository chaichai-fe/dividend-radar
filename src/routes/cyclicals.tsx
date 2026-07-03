import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ArrowUpDown, PlusCircle, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

import { listCyclicals } from '#/server/cyclicals'
import type { CyclicalQuote } from '#/server/cyclicals'
import { rateCyclicalYield } from '#/lib/cyclical-data'
import type { CyclicalCategory } from '#/lib/cyclical-data'
import { equityBondSpread } from '#/lib/rating'
import { addHolding } from '#/server/portfolio'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export const Route = createFileRoute('/cyclicals')({
  component: CyclicalsPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ['cyclicals'],
      queryFn: () => listCyclicals(),
    })
  },
})

type CategoryFilter = 'all' | CyclicalCategory | 'high'
type SortKey = 'yield' | 'pb' | 'change' | 'dps'

const filters: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高股息(≥5%)' },
  { key: '煤炭', label: '煤炭' },
  { key: '电力', label: '电力' },
]

const toneClass: Record<
  ReturnType<typeof rateCyclicalYield>['tone'],
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

const categoryTone: Record<CyclicalCategory, string> = {
  煤炭: 'bg-stone-500/15 text-stone-600 dark:text-stone-300',
  电力: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

function CyclicalsPage() {
  const query = useQuery({
    queryKey: ['cyclicals'],
    queryFn: () => listCyclicals(),
  })

  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortKey>('yield')
  const [target, setTarget] = useState<CyclicalQuote | null>(null)

  const rows = query.data?.rows ?? []

  const enriched = useMemo(() => {
    return rows.map((stock) => ({
      stock,
      rating: rateCyclicalYield(stock.dividendYield),
      spread: equityBondSpread(stock.dividendYield),
    }))
  }, [rows])

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    let list = enriched.filter(({ stock, rating }) => {
      if (kw) {
        const hay = `${stock.name}${stock.code}${stock.category}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      if (filter === 'all') return true
      if (filter === 'high') return rating.isHigh
      return stock.category === filter
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'pb':
          return a.stock.pb - b.stock.pb
        case 'change':
          return b.stock.changePct - a.stock.changePct
        case 'dps':
          return b.stock.dps - a.stock.dps
        default:
          return b.stock.dividendYield - a.stock.dividendYield
      }
    })
    return list
  }, [enriched, keyword, filter, sort])

  const highCount = enriched.filter((e) => e.rating.isHigh).length
  const coalCount = enriched.filter((e) => e.stock.category === '煤炭').length
  const powerCount = enriched.filter((e) => e.stock.category === '电力').length
  const avgYield =
    enriched.length > 0
      ? enriched.reduce((s, e) => s + e.stock.dividendYield, 0) /
        enriched.length
      : 0

  return (
    <div className="rise-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker">Cyclical Dividend</p>
          <h1 className="display-title mt-1 text-3xl font-bold text-foreground">
            煤炭电力周期股
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            汇总 A 股 {rows.length}
            家煤炭与电力周期红利股，按“每股分红 ÷ 实时股价”动态测算股息率，
            并对照十年国债做股债利差，筛选真正的高股息周期标的。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-xs text-muted-foreground">
            {query.data ? (
              <>
                <div>
                  实时股价 {query.data.liveCount}/{rows.length}
                </div>
                <div>分红数据 {rows[0]?.dataDate ?? '—'}</div>
              </>
            ) : (
              <div>加载中…</div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const id = toast.loading('正在刷新实时股价…')
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

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="收录标的" value={`${rows.length}`} unit="只" />
        <StatCard label="高股息(≥5%)" value={`${highCount}`} unit="只" accent />
        <StatCard label="煤炭 / 电力" value={`${coalCount}/${powerCount}`} unit="只" />
        <StatCard label="平均股息率" value={avgYield.toFixed(2)} unit="%" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名称 / 代码 / 行业"
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

      <div className="island-shell overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">标的 / 行业</th>
                <SortableTh
                  label="现价"
                  active={sort === 'change'}
                  onClick={() => setSort('change')}
                />
                <SortableTh
                  label="每股分红"
                  active={sort === 'dps'}
                  onClick={() => setSort('dps')}
                />
                <SortableTh
                  label="股息率"
                  active={sort === 'yield'}
                  onClick={() => setSort('yield')}
                />
                <th className="px-4 py-3 font-medium">股债利差</th>
                <SortableTh
                  label="PB"
                  active={sort === 'pb'}
                  onClick={() => setSort('pb')}
                />
                <th className="px-4 py-3 font-medium">评级</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="px-4 py-3" colSpan={8}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {visible.map(({ stock, rating, spread }) => (
                <tr
                  key={stock.code}
                  className="border-b border-border/60 transition hover:bg-accent/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {stock.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{stock.code}</span>
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          categoryTone[stock.category],
                        )}
                      >
                        {stock.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium tabular-nums text-foreground">
                      {stock.price.toFixed(2)}
                    </div>
                    <div
                      className={cn(
                        'text-xs tabular-nums',
                        stock.changePct > 0
                          ? 'text-rose-500'
                          : stock.changePct < 0
                            ? 'text-emerald-500'
                            : 'text-muted-foreground',
                      )}
                    >
                      {stock.changePct > 0 ? '+' : ''}
                      {stock.changePct.toFixed(2)}%
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 tabular-nums text-muted-foreground"
                    title={
                      stock.dpsYear
                        ? `${stock.dpsYear} 年度方案(前瞻口径，含已公告预案)`
                        : '参考值(实时接口未命中)'
                    }
                  >
                    {stock.dps.toFixed(4)}
                    <span className="ml-1 text-[10px] text-muted-foreground/70">
                      {stock.dpsYear ? `${stock.dpsYear}` : '参考'}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-base font-semibold tabular-nums text-foreground"
                    title={`股息率 = 每股分红 ${stock.dps.toFixed(3)} ÷ 现价 ${stock.price.toFixed(2)}${
                      stock.dpsYear
                        ? `（按 ${stock.dpsYear} 年度分红方案，含预案）`
                        : ''
                    }`}
                  >
                    {stock.dividendYield.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {spread > 0 ? '+' : ''}
                    {spread}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {stock.pb.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
                        toneClass[rating.tone],
                      )}
                    >
                      {rating.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTarget(stock)}
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
                    colSpan={8}
                  >
                    没有匹配的标的
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        股息率按“每股分红 ÷ 实时股价”动态计算，股价越低股息率越高。每股分红采用
        <span className="text-foreground">前瞻口径</span>
        ：取最新已公告年度分红合计（含预案/董事会或股东大会通过）。煤炭电力属周期行业，
        分红随业绩与煤价/电价波动，历史高股息不代表未来可持续。分红数据来自东方财富，PB
        为参考值。本工具仅供学习研究，不构成投资建议。
      </p>

      <AddDialog stock={target} onClose={() => setTarget(null)} />
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

function AddDialog({
  stock,
  onClose,
}: {
  stock: CyclicalQuote | null
  onClose: () => void
}) {
  const [shares, setShares] = useState('100')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  const rating = stock ? rateCyclicalYield(stock.dividendYield) : null

  async function confirm() {
    if (!stock) return
    const value = Number(shares)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('请输入有效的股数')
      return
    }
    setSaving(true)
    try {
      await addHolding({ data: { code: stock.code, amount: value } })
      await queryClient.invalidateQueries({ queryKey: ['holdings'] })
      toast.success(`已将 ${stock.name} 加入组合（${value.toLocaleString()} 股）`)
      onClose()
    } catch {
      toast.error('加入组合失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const numShares = Number(shares) || 0

  return (
    <Dialog open={Boolean(stock)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        {stock && rating && (
          <>
            <DialogHeader>
              <DialogTitle>
                加入组合 · {stock.name}（{stock.code}）
              </DialogTitle>
              <DialogDescription>
                {stock.category}｜股息率 {stock.dividendYield.toFixed(2)}%｜
                <span
                  className={cn(
                    'ml-1 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
                    toneClass[rating.tone],
                  )}
                >
                  {rating.label}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-3 text-center text-xs">
                <div>
                  <div className="text-muted-foreground">现价</div>
                  <div className="mt-1 font-semibold tabular-nums text-foreground">
                    {stock.price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">每股分红</div>
                  <div className="mt-1 font-semibold tabular-nums text-foreground">
                    {stock.dps.toFixed(4)}
                    {stock.dpsYear ? (
                      <span className="ml-1 text-[10px] text-muted-foreground/70">
                        {stock.dpsYear}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">PB</div>
                  <div className="mt-1 font-semibold tabular-nums text-foreground">
                    {stock.pb.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">买入股数（股）</label>
                <Input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  min={0}
                  step={100}
                />
                <p className="text-xs text-muted-foreground">
                  市值 ≈ ¥
                  {(numShares * stock.price).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                  ｜预计年分红 ≈ ¥
                  {(numShares * stock.dps).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
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
