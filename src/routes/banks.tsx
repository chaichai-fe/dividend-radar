import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { ArrowUpDown, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

import { listBanks } from '#/server/banks'
import { rateBankYield } from '#/lib/bank-data'
import type { BankCategory } from '#/lib/bank-data'
import { equityBondSpread } from '#/lib/rating'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/banks')({
  component: BanksPage,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ['banks'],
      queryFn: () => listBanks(),
    })
  },
})

type CategoryFilter = 'all' | BankCategory | 'high'
type SortKey = 'yield' | 'pb' | 'change' | 'dps'

const filters: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高股息(≥5%)' },
  { key: '国有大行', label: '国有大行' },
  { key: '股份行', label: '股份行' },
  { key: '城商行', label: '城商行' },
  { key: '农商行', label: '农商行' },
]

const toneClass: Record<
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

function BanksPage() {
  const query = useQuery({
    queryKey: ['banks'],
    queryFn: () => listBanks(),
  })

  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortKey>('yield')

  const rows = query.data?.rows ?? []

  const enriched = useMemo(() => {
    return rows.map((bank) => ({
      bank,
      rating: rateBankYield(bank.dividendYield),
      spread: equityBondSpread(bank.dividendYield),
    }))
  }, [rows])

  const visible = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    let list = enriched.filter(({ bank, rating }) => {
      if (kw) {
        const hay = `${bank.name}${bank.code}${bank.category}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      if (filter === 'all') return true
      if (filter === 'high') return rating.isHigh
      return bank.category === filter
    })
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'pb':
          return a.bank.pb - b.bank.pb
        case 'change':
          return b.bank.changePct - a.bank.changePct
        case 'dps':
          return b.bank.dps - a.bank.dps
        default:
          return b.bank.dividendYield - a.bank.dividendYield
      }
    })
    return list
  }, [enriched, keyword, filter, sort])

  const highCount = enriched.filter((e) => e.rating.isHigh).length
  const avgYield =
    enriched.length > 0
      ? enriched.reduce((s, e) => s + e.bank.dividendYield, 0) / enriched.length
      : 0
  const topYield =
    enriched.length > 0
      ? Math.max(...enriched.map((e) => e.bank.dividendYield))
      : 0

  return (
    <div className="rise-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker">Bank Dividend</p>
          <h1 className="display-title mt-1 text-3xl font-bold text-foreground">
            高股息银行统计
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            汇总 A 股 {rows.length} 家上市银行，按“每股分红 ÷
            实时股价”动态测算股息率，
            并对照十年国债做股债利差，筛选出真正的高股息标的。
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
        <StatCard label="收录银行" value={`${rows.length}`} unit="家" />
        <StatCard
          label="高股息(≥5%)"
          value={`${highCount}`}
          unit="家"
          accent
        />
        <StatCard label="平均股息率" value={avgYield.toFixed(2)} unit="%" />
        <StatCard label="最高股息率" value={topYield.toFixed(2)} unit="%" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索名称 / 代码 / 类型"
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
                <th className="px-4 py-3 font-medium">银行 / 类型</th>
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
              </tr>
            </thead>
            <tbody>
              {query.isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="px-4 py-3" colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {visible.map(({ bank, rating, spread }) => (
                <tr
                  key={bank.code}
                  className="border-b border-border/60 transition hover:bg-accent/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">
                      {bank.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bank.code} · {bank.category}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium tabular-nums text-foreground">
                      {bank.price.toFixed(2)}
                    </div>
                    <div
                      className={cn(
                        'text-xs tabular-nums',
                        bank.changePct > 0
                          ? 'text-rose-500'
                          : bank.changePct < 0
                            ? 'text-emerald-500'
                            : 'text-muted-foreground',
                      )}
                    >
                      {bank.changePct > 0 ? '+' : ''}
                      {bank.changePct.toFixed(2)}%
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 tabular-nums text-muted-foreground"
                    title={
                      bank.dpsYear
                        ? `${bank.dpsYear} 年度方案(前瞻口径，含已公告预案)`
                        : '参考值(实时接口未命中)'
                    }
                  >
                    {bank.dps.toFixed(4)}
                    <span className="ml-1 text-[10px] text-muted-foreground/70">
                      {bank.dpsYear ? `${bank.dpsYear}` : '参考'}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-base font-semibold tabular-nums text-foreground"
                    title={`股息率 = 每股分红 ${bank.dps.toFixed(3)} ÷ 现价 ${bank.price.toFixed(2)}${
                      bank.dpsYear
                        ? `（按 ${bank.dpsYear} 年度分红方案，含预案）`
                        : ''
                    }`}
                  >
                    {bank.dividendYield.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {spread > 0 ? '+' : ''}
                    {spread}%
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {bank.pb.toFixed(2)}
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
                </tr>
              ))}

              {!query.isLoading && visible.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-10 text-center text-muted-foreground"
                    colSpan={7}
                  >
                    没有匹配的银行
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
        ：取最新已公告年度分红合计（含预案/董事会或股东大会通过），第一时间反映分红上调或下调，
        故可能高于部分平台采用的“近 12 个月已实施”口径。分红数据来自东方财富，PB
        为参考值。本工具仅供学习研究，不构成投资建议。
      </p>
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
