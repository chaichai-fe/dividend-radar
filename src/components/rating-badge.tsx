import { cn } from '#/lib/utils.ts'
import type { Valuation } from '#/lib/rating'

const toneClass: Record<Valuation['tone'], string> = {
  'buy-strong':
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  buy: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
  hold: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  watch:
    'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  avoid: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
}

export function RatingBadge({
  valuation,
  className,
}: {
  valuation: Valuation
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        toneClass[valuation.tone],
        className,
      )}
    >
      {valuation.label}
      <span className="opacity-70">· {valuation.percentile}%</span>
    </span>
  )
}

/** 低估程度进度条：越满越便宜。 */
export function ValuationBar({ valuation }: { valuation: Valuation }) {
  const barColor: Record<Valuation['tone'], string> = {
    'buy-strong': 'bg-emerald-500',
    buy: 'bg-green-500',
    hold: 'bg-sky-500',
    watch: 'bg-amber-500',
    avoid: 'bg-rose-500',
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', barColor[valuation.tone])}
          style={{ width: `${valuation.percentile}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {valuation.percentile}
      </span>
    </div>
  )
}
